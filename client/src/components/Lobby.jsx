import React, { useState } from 'react';
import { formatCurrency, copyToClipboard } from '../utils/formatters';

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

export default function Lobby({ socket, gameId, playerId, gameState, isHost, onGameStarted, onLeave }) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [settings, setSettings] = useState(gameState.settings);
  const [savingSettings, setSavingSettings] = useState(false);

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const usedColors = gameState.players.map(p => p.color);

  const handleCopyGameCode = async () => {
    try {
      await copyToClipboard(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
      setSettings(gameState.settings); // Revert on error
    } finally {
      setSavingSettings(false);
    }
  };

  const SettingToggle = ({ label, settingKey, description }) => (
    <div className="setting-toggle-row">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        {description && <span className="setting-description">{description}</span>}
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
    <div className="lobby-container">
      <div className="lobby-card">
        {/* Header */}
        <div className="lobby-header">
          <svg width="32" height="32" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
            <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <circle cx="50" cy="50" r="12" fill="currentColor"/>
          </svg>
          <h1>Game Lobby</h1>
        </div>

        {/* Game Code */}
        <div className="game-code-section">
          <div className="game-code-box" onClick={handleCopyGameCode}>
            <div className="game-code-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Room Code
            </div>
            <div className="game-code-value">{gameId}</div>
            <button className="copy-btn" title="Copy to clipboard">
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>
          </div>
          <p className="game-code-hint">Share this code with friends to join</p>
        </div>

        {/* Players Section */}
        <div className="players-section">
          <div className="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h2>Players ({gameState.players.length}/6)</h2>
          </div>
          <div className="players-list">
            {gameState.players.map((player, index) => (
              <div key={player.id} className={`player-item ${player.id === playerId ? 'is-you' : ''}`}>
                <div
                  className="player-color-indicator"
                  style={{ backgroundColor: player.color }}
                  onClick={() => player.id === playerId && setShowColorPicker(true)}
                  title={player.id === playerId ? 'Click to change color' : ''}
                >
                  {player.id === playerId && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  )}
                </div>
                <span className="player-name">{player.name}</span>
                {index === 0 && <span className="host-badge">HOST</span>}
                {player.id === playerId && <span className="you-badge">YOU</span>}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 6 - gameState.players.length }, (_, i) => (
              <div key={`empty-${i}`} className="player-item empty">
                <div className="player-color-indicator empty" />
                <span className="player-name">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

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

        {/* Settings Section */}
        <div className="settings-section">
          <div className="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <h2>Game Rules</h2>
            {isHost && <span className="edit-hint">Tap to toggle</span>}
          </div>

          <div className="settings-list">
            {/* Starting Cash */}
            <div className="setting-toggle-row">
              <div className="setting-info">
                <span className="setting-label">Starting Cash</span>
                <span className="setting-description">Amount each player starts with</span>
              </div>
              {isHost ? (
                <select
                  className="setting-select"
                  value={settings.startingCash}
                  onChange={(e) => handleSettingChange('startingCash', parseInt(e.target.value))}
                  disabled={savingSettings}
                >
                  <option value={500}>$500</option>
                  <option value={1000}>$1,000</option>
                  <option value={1500}>$1,500</option>
                  <option value={2000}>$2,000</option>
                  <option value={2500}>$2,500</option>
                  <option value={3000}>$3,000</option>
                </select>
              ) : (
                <span className="setting-value">{formatCurrency(settings.startingCash)}</span>
              )}
            </div>

            <SettingToggle
              label="Auction Mode"
              settingKey="auctionMode"
              description="Unpurchased properties go to auction"
            />

            <SettingToggle
              label="Double GO Bonus"
              settingKey="doubleGoBonus"
              description="Land on GO to collect $300"
            />

            <SettingToggle
              label="No Rent in Jail"
              settingKey="noRentInJail"
              description="Can't collect rent while in jail"
            />

            <SettingToggle
              label="Mortgage Mode"
              settingKey="mortgageMode"
              description="Allow mortgaging properties"
            />

            <SettingToggle
              label="Even Build"
              settingKey="evenBuild"
              description="Must build houses evenly"
            />

            <SettingToggle
              label="Speed Die"
              settingKey="speedDie"
              description="Roll 3 dice for faster gameplay"
            />
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
              Waiting for host to start the game
            </div>
          )}

          <button className="btn btn-secondary" onClick={handleLeave}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
