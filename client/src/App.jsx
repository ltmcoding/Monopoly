import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './styles/App.css';

function App() {
  const socket = useSocket();
  const [screen, setScreen] = useState('home'); // home, lobby, game
  const [gameInfo, setGameInfo] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [showConnectionOverlay, setShowConnectionOverlay] = useState(false);
  const [lobbyDeletedMessage, setLobbyDeletedMessage] = useState(null);

  // Only show connection overlay after being disconnected for 3+ seconds
  useEffect(() => {
    let timer;
    if (!socket.connected) {
      timer = setTimeout(() => {
        setShowConnectionOverlay(true);
      }, 3000);
    } else {
      setShowConnectionOverlay(false);
    }
    return () => clearTimeout(timer);
  }, [socket.connected]);

  useEffect(() => {
    // Listen for game started event
    const handleGameStarted = (data) => {
      setGameState(data.gameState);
      setScreen('game');
    };

    // Listen for player joined event
    const handlePlayerJoined = (data) => {
      setGameState(data.gameState);
    };

    // Listen for player left event
    const handlePlayerLeft = (data) => {
      setGameState(data.gameState);
    };

    // Listen for settings updated event
    const handleSettingsUpdated = (data) => {
      setGameState(data.gameState);
    };

    // Listen for player color changed event
    const handlePlayerColorChanged = (data) => {
      setGameState(data.gameState);
    };

    // Listen for lobby deleted event
    const handleLobbyDeleted = (data) => {
      setLobbyDeletedMessage(data.message || 'Lobby was deleted due to inactivity');
      setScreen('home');
      setGameInfo(null);
      setGameState(null);
    };

    socket.on('gameStarted', handleGameStarted);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('settingsUpdated', handleSettingsUpdated);
    socket.on('playerColorChanged', handlePlayerColorChanged);
    socket.on('lobbyDeleted', handleLobbyDeleted);

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('settingsUpdated', handleSettingsUpdated);
      socket.off('playerColorChanged', handlePlayerColorChanged);
      socket.off('lobbyDeleted', handleLobbyDeleted);
    };
  }, [socket]);

  const handleGameCreated = (info) => {
    console.log('handleGameCreated called with:', info);
    setGameInfo(info);
    setGameState(info.gameState || null);
    setScreen('lobby');
  };

  const handleGameJoined = (info) => {
    console.log('handleGameJoined called with:', info);
    setGameInfo(info);
    setGameState(info.gameState || null);
    setScreen('lobby');
  };

  const handleGameStarted = () => {
    // Game state will be updated via socket event
  };

  const handleLeaveLobby = () => {
    setScreen('home');
    setGameInfo(null);
    setGameState(null);
  };

  const handleExitGame = () => {
    setScreen('home');
    setGameInfo(null);
    setGameState(null);
  };

  // Clear lobby deleted message when user dismisses it
  const dismissLobbyDeletedMessage = () => {
    setLobbyDeletedMessage(null);
  };

  return (
    <div className="App">
      {screen === 'home' && (
        <Home
          socket={socket}
          onGameCreated={handleGameCreated}
          onGameJoined={handleGameJoined}
        />
      )}

      {screen === 'lobby' && gameInfo && gameState && (
        <Lobby
          socket={socket}
          gameId={gameInfo.gameId}
          playerId={gameInfo.playerId}
          gameState={gameState}
          isHost={gameInfo.isHost}
          onGameStarted={handleGameStarted}
          onLeave={handleLeaveLobby}
        />
      )}

      {screen === 'game' && gameInfo && gameState && (
        <Game
          socket={socket}
          gameId={gameInfo.gameId}
          playerId={gameInfo.playerId}
          initialGameState={gameState}
          onExit={handleExitGame}
        />
      )}

      {/* Only show connection overlay after 3 seconds of disconnection */}
      {showConnectionOverlay && (
        <div className="connection-overlay">
          <div className="connection-message">
            Connecting to server...
          </div>
        </div>
      )}

      {/* Lobby deleted notification */}
      {lobbyDeletedMessage && (
        <div className="modal-overlay" onClick={dismissLobbyDeletedMessage}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Lobby Closed</h2>
            <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-secondary)' }}>
              {lobbyDeletedMessage}
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={dismissLobbyDeletedMessage}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
