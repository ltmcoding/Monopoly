import React, { useState } from 'react';
import RoomBrowser from './RoomBrowser';

// Default settings for new games
const DEFAULT_SETTINGS = {
  auctionMode: true,
  noRentInJail: false,
  mortgageMode: true,
  evenBuild: true,
  unlimitedProperties: false,
  startingCash: 1500,
  speedDie: false,
  doubleGoBonus: false
};

export default function Home({ socket, onGameCreated, onGameJoined }) {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);

  const handleQuickPlay = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await socket.quickPlay(playerName.trim(), DEFAULT_SETTINGS);

      if (response.created) {
        // Created new game
        onGameCreated({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: playerName.trim(),
          isHost: true,
          gameState: response.gameState
        });
      } else {
        // Joined existing game
        onGameJoined({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: playerName.trim(),
          isHost: false,
          gameState: response.gameState
        });
      }
    } catch (err) {
      console.error('Quick play error:', err);
      setError(err.message || 'Failed to find or create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFromBrowser = async (gameId) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await socket.joinGame(gameId, playerName.trim());

      onGameJoined({
        gameId: gameId,
        playerId: response.player.id,
        playerName: playerName.trim(),
        isHost: response.isHost,
        gameState: response.gameState
      });
    } catch (err) {
      setError(err.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        {/* Logo/Title Section */}
        <div className="home-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
              <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="50" r="12" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="game-title">MONOPOLY</h1>
          <p className="game-subtitle">Multiplayer Edition</p>
        </div>

        {!socket.connected && (
          <div className="connection-status error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Connecting to server...
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* Name Input */}
        <div className="home-name-section">
          <label className="input-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Your Name
          </label>
          <input
            type="text"
            className="player-name-input"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            disabled={loading}
          />
        </div>

        {/* Main Actions */}
        <div className="home-actions">
          {/* Play Button - Large and prominent */}
          <button
            className="btn btn-play"
            onClick={handleQuickPlay}
            disabled={!socket.connected || loading || !playerName.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span className="btn-play-text">
              {loading ? 'Finding Game...' : 'Play'}
            </span>
            <span className="btn-play-hint">Join or create a game</span>
          </button>

          {/* Secondary Buttons */}
          <div className="home-secondary-actions">
            <button
              className="btn btn-secondary-action"
              onClick={() => setShowRoomBrowser(true)}
              disabled={!socket.connected || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              Room Browser
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="home-footer">
          <p>2-6 Players</p>
        </div>
      </div>

      {/* Room Browser Modal */}
      {showRoomBrowser && (
        <RoomBrowser
          socket={socket}
          playerName={playerName}
          onJoin={handleJoinFromBrowser}
          onClose={() => setShowRoomBrowser(false)}
          disabled={loading || !playerName.trim()}
        />
      )}
    </div>
  );
}
