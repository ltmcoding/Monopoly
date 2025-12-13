import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { formatCurrency, copyToClipboard } from '../utils/formatters';

export default function Lobby({ gameId, gameState, isHost, onGameStarted, onLeave }) {
  const socket = useSocket();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

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

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1>Game Lobby</h1>

        <div className="game-code-section">
          <div className="game-code-label">Game Code:</div>
          <div className="game-code-display" onClick={handleCopyGameCode}>
            {gameId}
            <button className="copy-btn" title="Copy to clipboard">
              {copied ? '✓ Copied!' : '📋'}
            </button>
          </div>
          <p className="game-code-hint">Share this code with friends to join</p>
        </div>

        <div className="players-section">
          <h2>Players ({gameState.players.length}/6)</h2>
          <div className="players-list">
            {gameState.players.map((player, index) => (
              <div key={player.id} className="player-item">
                <div
                  className="player-color-indicator"
                  style={{ backgroundColor: player.color }}
                />
                <span className="player-name">{player.name}</span>
                {index === 0 && <span className="host-badge">HOST</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h2>Game Settings</h2>
          <div className="settings-summary">
            <div className="setting-row">
              <span>Starting Cash:</span>
              <span>{formatCurrency(gameState.settings.startingCash)}</span>
            </div>
            <div className="setting-row">
              <span>Auction Mode:</span>
              <span>{gameState.settings.auctionMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="setting-row">
              <span>No Rent in Jail:</span>
              <span>{gameState.settings.noRentInJail ? 'ON' : 'OFF'}</span>
            </div>
            <div className="setting-row">
              <span>Mortgage Mode:</span>
              <span>{gameState.settings.mortgageMode ? 'ON' : 'OFF'}</span>
            </div>
            <div className="setting-row">
              <span>Even Build:</span>
              <span>{gameState.settings.evenBuild ? 'ON' : 'OFF'}</span>
            </div>
            <div className="setting-row">
              <span>Unlimited Properties:</span>
              <span>{gameState.settings.unlimitedProperties ? 'ON' : 'OFF'}</span>
            </div>
            <div className="setting-row">
              <span>Speed Die:</span>
              <span>{gameState.settings.speedDie ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>

        <div className="lobby-actions">
          {isHost ? (
            <button
              className="btn btn-primary btn-large"
              onClick={handleStartGame}
              disabled={gameState.players.length < 2 || starting}
            >
              {starting ? 'Starting...' : 'Start Game'}
            </button>
          ) : (
            <div className="waiting-message">
              Waiting for host to start the game...
            </div>
          )}

          <button className="btn btn-secondary" onClick={handleLeave}>
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
