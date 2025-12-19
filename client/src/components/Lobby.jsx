import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';

// 16 player token colors
const TOKEN_COLORS = [
  '#e53e3e', // Red
  '#dd6b20', // Orange
  '#d69e2e', // Yellow
  '#38a169', // Green
  '#319795', // Teal
  '#3182ce', // Blue
  '#5a67d8', // Indigo
  '#805ad5', // Purple
  '#d53f8c', // Pink
  '#718096', // Gray
  '#4a5568', // Dark Gray
  '#744210', // Brown
  '#276749', // Dark Green
  '#2c5282', // Dark Blue
  '#702459', // Maroon
  '#553c9a', // Deep Purple
];

// Game Edition data
const GAME_EDITIONS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original Monopoly experience',
    available: true,
    gradient: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 25%, #1a1a2e 50%, #006400 75%, #004d00 100%)'
  },
  {
    id: 'speed-die',
    name: 'Speed Die',
    description: 'Faster gameplay with the speed die',
    available: false,
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%)'
  },
  {
    id: 'mega-monopoly',
    name: 'Mega Monopoly',
    description: 'Larger board, more properties',
    available: false,
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4776e6 100%)'
  },
  {
    id: 'buy-everything',
    name: 'Buy Everything',
    description: 'Purchase any space on the board',
    available: false,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #00d084 100%)'
  }
];

// Standard cash presets
const CASH_PRESETS = [500, 1000, 1500, 2000, 2500, 3000];

export default function Lobby({ socket, gameId, playerId, gameState, isHost, onGameStarted, onLeave }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [settings, setSettings] = useState(gameState.settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState(gameState.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [showCustomCash, setShowCustomCash] = useState(false);
  const [customCashValue, setCustomCashValue] = useState('');
  const [kickConfirm, setKickConfirm] = useState(null);
  const [isPrivate, setIsPrivate] = useState(gameState.isPrivate || false);
  const chatEndRef = useRef(null);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const usedColors = gameState.players.map(p => p.color);
  const isCustomCash = !CASH_PRESETS.includes(settings.startingCash);

  // Get full game link
  const getGameLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/${gameId}`;
  };

  // Chat message listener
  useEffect(() => {
    const handleChatMessage = ({ chatMessage }) => {
      setChatMessages(prev => [...prev.slice(-49), chatMessage]);
    };

    const handlePrivacyToggled = ({ systemMessage, gameState: newState, isPrivate: newPrivacy }) => {
      if (systemMessage) {
        setChatMessages(prev => [...prev.slice(-49), systemMessage]);
      }
      setSettings(newState.settings);
      setIsPrivate(newPrivacy);
    };

    const handlePlayerJoined = ({ systemMessage }) => {
      if (systemMessage) {
        setChatMessages(prev => [...prev.slice(-49), systemMessage]);
      }
    };

    const handlePlayerLeft = ({ systemMessage }) => {
      if (systemMessage) {
        setChatMessages(prev => [...prev.slice(-49), systemMessage]);
      }
    };

    const handlePlayerKicked = ({ systemMessage }) => {
      if (systemMessage) {
        setChatMessages(prev => [...prev.slice(-49), systemMessage]);
      }
    };

    const handleKicked = () => {
      alert('You were kicked from the lobby');
      onLeave();
    };

    socket.on('chatMessageReceived', handleChatMessage);
    socket.on('privacyToggled', handlePrivacyToggled);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('playerKicked', handlePlayerKicked);
    socket.on('kicked', handleKicked);

    return () => {
      socket.off('chatMessageReceived', handleChatMessage);
      socket.off('privacyToggled', handlePrivacyToggled);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('playerKicked', handlePlayerKicked);
      socket.off('kicked', handleKicked);
    };
  }, [socket, onLeave]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Sync settings from parent
  useEffect(() => {
    setSettings(gameState.settings);
  }, [gameState.settings]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getGameLink());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleStartGame = async () => {
    if (gameState.players.length < 2) {
      alert('Need at least 2 players to start');
      return;
    }

    setStarting(true);
    try {
      await socket.startGame(gameId);
      onGameStarted();
    } catch (err) {
      alert(err.message || 'Failed to start game');
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    try {
      await socket.leaveGame(gameId);
      onLeave();
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  };

  const handleColorChange = async (color) => {
    try {
      await socket.changePlayerColor(gameId, color);
      setShowColorPicker(false);
    } catch (err) {
      console.error('Failed to change color:', err);
      alert(err.message || 'Failed to change color');
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSavingSettings(true);
    try {
      await socket.updateSettings(gameId, newSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setSettings(gameState.settings);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      await socket.sendChatMessage(gameId, chatInput.trim());
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      await socket.togglePrivacy(gameId);
    } catch (err) {
      console.error('Failed to toggle privacy:', err);
      alert(err.message || 'Failed to toggle privacy');
    }
  };

  const handleKickPlayer = async (targetSocketId) => {
    try {
      await socket.kickPlayer(gameId, targetSocketId);
      setKickConfirm(null);
    } catch (err) {
      console.error('Failed to kick player:', err);
      alert(err.message || 'Failed to kick player');
    }
  };

  const handleStartingCashChange = (value) => {
    if (value === 'custom') {
      setShowCustomCash(true);
      return;
    }
    handleSettingChange('startingCash', parseInt(value));
  };

  const handleCustomCashSubmit = () => {
    const value = parseInt(customCashValue);
    if (value >= 100 && value <= 10000) {
      handleSettingChange('startingCash', value);
      setShowCustomCash(false);
      setCustomCashValue('');
    } else {
      alert('Value must be between $100 and $10,000');
    }
  };

  const SettingToggle = ({ label, settingKey, description }) => (
    <div className="setting-toggle-row compact">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
      </div>
      {isHost ? (
        <button
          className={`toggle-btn ${settings[settingKey] ? 'active' : ''}`}
          onClick={() => handleSettingChange(settingKey, !settings[settingKey])}
          disabled={savingSettings}
        >
          <span className="toggle-slider" />
        </button>
      ) : (
        <span className={`setting-badge ${settings[settingKey] ? 'on' : 'off'}`}>
          {settings[settingKey] ? 'ON' : 'OFF'}
        </span>
      )}
    </div>
  );

  return (
    <div className="lobby-container lobby-revamp lobby-three-col">
      {/* Main content area - three columns */}
      <div className="lobby-content">
        {/* Left Panel - Chat */}
        <div className="lobby-chat-panel">
          <div className="chat-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>Chat</h3>
          </div>
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.type === 'system' ? 'system' : ''}`}>
                  {msg.type === 'player' ? (
                    <>
                      <span className="chat-player-name" style={{ color: msg.playerColor }}>
                        {msg.playerName}
                      </span>
                      <span className="chat-text">{msg.message}</span>
                    </>
                  ) : (
                    <span className="chat-system-text">{msg.message}</span>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Middle Panel - Main Content */}
        <div className="lobby-main-panel">
          {/* Title Section */}
          <div className="lobby-title-section">
            <div className="lobby-title-row">
              <svg width="36" height="36" viewBox="0 0 100 100">
                <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
                <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
                <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
                <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
                <circle cx="50" cy="50" r="12" fill="currentColor"/>
              </svg>
              <h1>Game Lobby</h1>
              {isHost && (
                <button
                  className={`privacy-toggle-btn ${isPrivate ? 'is-private' : ''}`}
                  onClick={handleTogglePrivacy}
                  title={isPrivate ? 'Room is private' : 'Room is public'}
                >
                  {isPrivate ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Private
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                      </svg>
                      Public
                    </>
                  )}
                </button>
              )}
              {!isHost && isPrivate && (
                <span className="privacy-badge private">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Private
                </span>
              )}
            </div>
          </div>

          {/* Game Code Section */}
          <div className="game-code-section">
            <div className="game-code-box">
              <div className="game-code-info">
                <div className="game-code-label">Room Code</div>
                <div className="game-code-value">{gameId}</div>
              </div>
              <div className="game-code-actions">
                <button className="copy-btn" onClick={handleCopyLink} title="Copy game link">
                  {copiedLink ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      Link
                    </>
                  )}
                </button>
                <button className="copy-btn secondary" onClick={handleCopyCode} title="Copy code only">
                  {copiedCode ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="players-section">
            <div className="section-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h2>Players</h2>
            </div>
            <div className="players-list dynamic compact">
              {gameState.players.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-item ${player.id === playerId ? 'is-you' : ''} animate-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="player-color-indicator"
                    style={{ backgroundColor: player.color }}
                    onClick={() => player.id === playerId && setShowColorPicker(true)}
                    title={player.id === playerId ? 'Click to change color' : ''}
                  >
                    {player.id === playerId && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    )}
                  </div>
                  <span className="player-name">{player.name}</span>
                  {index === 0 && <span className="host-badge">HOST</span>}
                  {player.id === playerId && <span className="you-badge">YOU</span>}
                  {isHost && player.id !== playerId && (
                    <button
                      className="kick-btn"
                      onClick={() => setKickConfirm(player)}
                      title="Kick player"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Edition Section */}
          <div className="edition-section compact">
            <div className="section-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <h2>Game Edition</h2>
            </div>
            <div className="edition-cards-container">
              <div className="edition-cards-scroll">
                {GAME_EDITIONS.map((edition) => (
                  <div
                    key={edition.id}
                    className={`edition-card compact ${settings.gameEdition === edition.id || (edition.id === 'classic' && !settings.gameEdition) ? 'selected' : ''} ${!edition.available ? 'disabled' : ''}`}
                    onClick={() => edition.available && isHost && handleSettingChange('gameEdition', edition.id)}
                    data-edition={edition.id}
                  >
                    <div className="edition-card-image" style={{ background: edition.gradient }}>
                      {!edition.available && (
                        <div className="edition-overlay">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="edition-card-content">
                      <h4>{edition.name}</h4>
                      {!edition.available && (
                        <span className="coming-soon-badge">Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lobby-actions">
            {isHost ? (
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartGame}
                disabled={gameState.players.length < 2 || starting}
              >
                {starting ? (
                  <>
                    <div className="loading-spinner small" />
                    Starting...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    Start Game
                  </>
                )}
              </button>
            ) : (
              <div className="waiting-message">
                <div className="waiting-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Waiting for host
              </div>
            )}

            <button className="btn btn-secondary" onClick={handleLeave}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Leave
            </button>
          </div>
        </div>

        {/* Right Panel - Game Rules */}
        <div className="lobby-rules-panel">
          <div className="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <h2>Rules</h2>
          </div>

          <div className="settings-list compact">
            {/* Number of Players */}
            <div className="setting-toggle-row compact">
              <div className="setting-info">
                <span className="setting-label">Max Players</span>
              </div>
              {isHost ? (
                <select
                  className="setting-select compact"
                  value={settings.maxPlayers || 6}
                  onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                  disabled={savingSettings}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ) : (
                <span className="setting-value">{settings.maxPlayers || 6}</span>
              )}
            </div>

            {/* Starting Cash */}
            <div className="setting-toggle-row compact">
              <div className="setting-info">
                <span className="setting-label">Starting Cash</span>
              </div>
              {isHost ? (
                <div className="starting-cash-control">
                  {showCustomCash ? (
                    <div className="custom-cash-input compact">
                      <span className="cash-prefix">$</span>
                      <input
                        type="number"
                        value={customCashValue}
                        onChange={(e) => setCustomCashValue(e.target.value)}
                        placeholder="Amount"
                        min="100"
                        max="10000"
                        className="cash-input"
                        autoFocus
                      />
                      <button onClick={handleCustomCashSubmit} className="cash-confirm-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                      <button onClick={() => { setShowCustomCash(false); setCustomCashValue(''); }} className="cash-cancel-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="cash-select-wrapper">
                      {isCustomCash && (
                        <>
                          <span className="current-custom-value">{formatCurrency(settings.startingCash)}</span>
                          <button
                            className="cash-edit-btn"
                            onClick={() => setShowCustomCash(true)}
                            title="Edit custom amount"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                          </button>
                        </>
                      )}
                      <select
                        className="setting-select compact"
                        value={isCustomCash ? 'custom' : settings.startingCash}
                        onChange={(e) => handleStartingCashChange(e.target.value)}
                        disabled={savingSettings}
                      >
                        {CASH_PRESETS.map(amount => (
                          <option key={amount} value={amount}>{formatCurrency(amount)}</option>
                        ))}
                        <option value="custom">Custom...</option>
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <span className="setting-value">{formatCurrency(settings.startingCash)}</span>
              )}
            </div>

            <SettingToggle label="Auction Mode" settingKey="auctionMode" />
            <SettingToggle label="Double GO Bonus" settingKey="doubleGoBonus" />
            <SettingToggle label="No Rent in Jail" settingKey="noRentInJail" />
            <SettingToggle label="Mortgage Mode" settingKey="mortgageMode" />
            <SettingToggle label="Even Build" settingKey="evenBuild" />
            <SettingToggle label="Free Parking Jackpot" settingKey="freeParking" />
          </div>
        </div>
      </div>

      {/* Kick Confirmation Modal */}
      {kickConfirm && (
        <div className="kick-confirm-overlay" onClick={() => setKickConfirm(null)}>
          <div className="kick-confirm-modal" onClick={e => e.stopPropagation()}>
            <p>Kick <strong>{kickConfirm.name}</strong> from the lobby?</p>
            <div className="kick-confirm-actions">
              <button className="btn btn-danger" onClick={() => handleKickPlayer(kickConfirm.id)}>
                Kick
              </button>
              <button className="btn btn-secondary" onClick={() => setKickConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="color-picker-overlay" onClick={() => setShowColorPicker(false)}>
          <div className="color-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="color-picker-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
                <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
                <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
                <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              <h3>Choose Your Color</h3>
              <button className="btn-close" onClick={() => setShowColorPicker(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="color-grid">
              {TOKEN_COLORS.map(color => {
                const isUsed = usedColors.includes(color) && color !== currentPlayer?.color;
                const isSelected = color === currentPlayer?.color;
                return (
                  <button
                    key={color}
                    className={`color-option ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => !isUsed && handleColorChange(color)}
                    disabled={isUsed}
                    title={isUsed ? 'Color taken by another player' : ''}
                  >
                    {isSelected && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {isUsed && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.7">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
