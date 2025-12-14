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

    socket.on('gameStarted', handleGameStarted);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);

    return () => {
      socket.off('gameStarted', handleGameStarted);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
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

      {!socket.connected && (
        <div className="connection-overlay">
          <div className="connection-message">
            Connecting to server...
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
