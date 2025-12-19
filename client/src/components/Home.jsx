import React, { useState } from 'react';
import RoomBrowser from './RoomBrowser';
import { generateRandomName } from '../utils/nameGenerator';

// Default settings for new games
const DEFAULT_SETTINGS = {
  auctionMode: true,
  noRentInJail: false,
  mortgageMode: true,
  evenBuild: true,
  unlimitedProperties: false,
  startingCash: 1500,
  doubleGoBonus: false,
  freeParking: false,
  maxPlayers: 6
};

export default function Home({ socket, onGameCreated, onGameJoined }) {
  const [playerName, setPlayerName] = useState('');
  const [placeholderName, setPlaceholderName] = useState(() => generateRandomName());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);

  // Get the name to use (user input or generated placeholder)
  const getNameToUse = () => playerName.trim() || placeholderName;

  const handleQuickPlay = async () => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.quickPlay(nameToUse, DEFAULT_SETTINGS);

      if (response.created) {
        // Created new game
        onGameCreated({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: nameToUse,
          isHost: true,
          gameState: response.gameState
        });
      } else {
        // Joined existing game
        onGameJoined({
          gameId: response.gameId,
          playerId: response.player.id,
          playerName: nameToUse,
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

  const handleCreatePrivateRoom = async () => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.createPrivateRoom(nameToUse, DEFAULT_SETTINGS);

      onGameCreated({
        gameId: response.gameId,
        playerId: response.player.id,
        playerName: nameToUse,
        isHost: true,
        gameState: response.gameState,
        isPrivate: true
      });
    } catch (err) {
      console.error('Create private room error:', err);
      setError(err.message || 'Failed to create private room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFromBrowser = async (gameId) => {
    const nameToUse = getNameToUse();

    setLoading(true);
    setError('');

    try {
      const response = await socket.joinGame(gameId, nameToUse);

      onGameJoined({
        gameId: gameId,
        playerId: response.player.id,
        playerName: nameToUse,
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
            <button
              type="button"
              className="btn-refresh-name"
              onClick={() => setPlaceholderName(generateRandomName())}
              title="Generate new random name"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </label>
          <input
            type="text"
            className="player-name-input"
            placeholder={placeholderName}
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
            disabled={!socket.connected || loading}
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
              onClick={handleCreatePrivateRoom}
              disabled={!socket.connected || loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Private Room
            </button>
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
      </div>

      {/* Room Browser Modal */}
      {showRoomBrowser && (
        <RoomBrowser
          socket={socket}
          playerName={getNameToUse()}
          onJoin={handleJoinFromBrowser}
          onClose={() => setShowRoomBrowser(false)}
          disabled={loading}
        />
      )}
    </div>
  );
}
