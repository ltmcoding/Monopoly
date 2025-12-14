import React, { useState } from 'react';

export default function Home({ socket, onGameCreated, onGameJoined }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Game settings
  const [settings, setSettings] = useState({
    auctionMode: true,
    noRentInJail: false,
    mortgageMode: true,
    evenBuild: true,
    unlimitedProperties: false,
    startingCash: 1500,
    speedDie: false
  });

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating game with settings:', settings);
      const response = await socket.createGame(settings);
      console.log('Game created:', response);
      const gameId = response.gameId;

      // Join the game we just created
      console.log('Joining game:', gameId, 'as', playerName.trim());
      const joinResponse = await socket.joinGame(gameId, playerName.trim());
      console.log('Join response:', joinResponse);

      console.log('Calling onGameCreated with:', {
        gameId,
        playerId: joinResponse.player.id,
        playerName: playerName.trim(),
        isHost: true,
        gameState: joinResponse.gameState
      });

      onGameCreated({
        gameId,
        playerId: joinResponse.player.id,
        playerName: playerName.trim(),
        isHost: true,
        gameState: joinResponse.gameState
      });
    } catch (err) {
      console.error('Game creation error:', err);
      setError(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!joinGameId.trim()) {
      setError('Please enter a game code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await socket.joinGame(joinGameId.trim().toUpperCase(), playerName.trim());

      onGameJoined({
        gameId: joinGameId.trim().toUpperCase(),
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
        <h1 className="game-title">MONOPOLY</h1>
        <p className="game-subtitle">Multiplayer Online Edition</p>

        {!socket.connected && (
          <div className="connection-status error">
            Connecting to server...
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="home-actions">
          <input
            type="text"
            className="player-name-input"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            disabled={loading}
          />

          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={!socket.connected || loading || !playerName.trim()}
          >
            Create New Game
          </button>

          <div className="join-game-section">
            <input
              type="text"
              className="game-code-input"
              placeholder="Enter game code"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
              maxLength={6}
              disabled={loading}
            />
            <button
              className="btn btn-secondary"
              onClick={handleJoinGame}
              disabled={!socket.connected || loading || !playerName.trim() || !joinGameId.trim()}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Game Settings</h2>

            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.auctionMode}
                    onChange={(e) => setSettings({ ...settings, auctionMode: e.target.checked })}
                  />
                  <span>Auction Mode</span>
                </label>
                <p className="setting-description">Auction property when declined</p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.noRentInJail}
                    onChange={(e) => setSettings({ ...settings, noRentInJail: e.target.checked })}
                  />
                  <span>No Rent in Jail</span>
                </label>
                <p className="setting-description">Players in jail cannot collect rent</p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.mortgageMode}
                    onChange={(e) => setSettings({ ...settings, mortgageMode: e.target.checked })}
                  />
                  <span>Mortgage Mode</span>
                </label>
                <p className="setting-description">Enable property mortgaging</p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.evenBuild}
                    onChange={(e) => setSettings({ ...settings, evenBuild: e.target.checked })}
                  />
                  <span>Even Build</span>
                </label>
                <p className="setting-description">Must build evenly across color set</p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.unlimitedProperties}
                    onChange={(e) => setSettings({ ...settings, unlimitedProperties: e.target.checked })}
                  />
                  <span>Unlimited Properties</span>
                </label>
                <p className="setting-description">No limit on houses/hotels</p>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.speedDie}
                    onChange={(e) => setSettings({ ...settings, speedDie: e.target.checked })}
                  />
                  <span>Speed Die</span>
                </label>
                <p className="setting-description">Use third die for faster gameplay</p>
              </div>

              <div className="setting-item full-width">
                <label>
                  <span>Starting Cash: ${settings.startingCash}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={settings.startingCash}
                  onChange={(e) => setSettings({ ...settings, startingCash: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  setShowCreateModal(false);
                  await handleCreateGame();
                }}
                disabled={loading}
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
