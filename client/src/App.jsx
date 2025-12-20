import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { Spinner, WarningCircle, X } from '@phosphor-icons/react';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// Session storage keys
const STORAGE_KEYS = {
  GAME_INFO: 'monopoly_game_info',
  PLAYER_NAME: 'monopoly_player_name',
  SESSION_ID: 'monopoly_session_id'
};

// Get game code from URL path
const getGameCodeFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/([A-Z0-9]{6})$/i);
  return match ? match[1].toUpperCase() : null;
};

// Update browser URL
const updateUrl = (gameId) => {
  if (gameId) {
    window.history.pushState({ gameId }, '', `/${gameId}`);
  } else {
    window.history.pushState({}, '', '/');
  }
};

function App() {
  const socket = useSocket();
  const [screen, setScreen] = useState('home'); // home, lobby, game
  const [gameInfo, setGameInfo] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [showConnectionOverlay, setShowConnectionOverlay] = useState(false);
  const [lobbyDeletedMessage, setLobbyDeletedMessage] = useState(null);
  const [urlGameCode, setUrlGameCode] = useState(() => getGameCodeFromUrl());
  const [attemptingReconnect, setAttemptingReconnect] = useState(false);

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

  // Save game info to session storage when it changes
  useEffect(() => {
    if (gameInfo && gameState) {
      sessionStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({
        gameId: gameInfo.gameId,
        playerId: gameInfo.playerId,
        playerName: gameInfo.playerName,
        sessionId: gameInfo.sessionId,
        isHost: gameInfo.isHost,
        screen: screen
      }));
    }
  }, [gameInfo, gameState, screen]);

  // Attempt to reconnect on page load if there's a game code in URL or session storage
  useEffect(() => {
    if (!socket.connected || attemptingReconnect) return;

    const urlCode = getGameCodeFromUrl();
    const savedInfo = sessionStorage.getItem(STORAGE_KEYS.GAME_INFO);

    // If URL has a game code, try to join that game
    if (urlCode) {
      setAttemptingReconnect(true);

      // Check if we have saved info for this game
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          if (info.gameId === urlCode && info.sessionId) {
            // Try to rejoin with saved session ID (reconnect as same player)
            socket.joinGame(urlCode, info.playerName, info.sessionId)
              .then(response => {
                setGameInfo({
                  gameId: urlCode,
                  playerId: response.player.id,
                  playerName: info.playerName,
                  sessionId: response.sessionId,
                  isHost: response.isHost
                });
                setGameState(response.gameState);
                if (response.gameState.status === 'playing') {
                  setScreen('game');
                } else {
                  setScreen('lobby');
                }
                console.log(response.isReconnect ? 'Reconnected to game' : 'Joined game');
              })
              .catch(err => {
                console.log('Failed to rejoin game:', err.message);
                // Clear saved info and stay on home
                sessionStorage.removeItem(STORAGE_KEYS.GAME_INFO);
                setUrlGameCode(urlCode); // Pass to Home component
              })
              .finally(() => setAttemptingReconnect(false));
            return;
          }
        } catch (e) {
          console.error('Error parsing saved game info:', e);
        }
      }

      // No saved info, just pass the game code to Home to prompt join
      setUrlGameCode(urlCode);
      setAttemptingReconnect(false);
    }
  }, [socket.connected]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const gameCode = getGameCodeFromUrl();
      if (!gameCode && screen !== 'home') {
        // User navigated back to home
        handleLeaveLobby();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen]);

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
    setGameInfo({
      ...info,
      sessionId: info.sessionId
    });
    setGameState(info.gameState || null);
    setScreen('lobby');
    updateUrl(info.gameId);
    // Save player name for reconnection
    sessionStorage.setItem(STORAGE_KEYS.PLAYER_NAME, info.playerName);
  };

  const handleGameJoined = (info) => {
    console.log('handleGameJoined called with:', info);
    setGameInfo({
      ...info,
      sessionId: info.sessionId
    });
    setGameState(info.gameState || null);
    setScreen('lobby');
    updateUrl(info.gameId);
    // Save player name for reconnection
    sessionStorage.setItem(STORAGE_KEYS.PLAYER_NAME, info.playerName);
    // Clear URL game code since we've joined
    setUrlGameCode(null);
  };

  const handleGameStarted = () => {
    // Game state will be updated via socket event
  };

  const handleLeaveLobby = () => {
    setScreen('home');
    setGameInfo(null);
    setGameState(null);
    updateUrl(null);
    sessionStorage.removeItem(STORAGE_KEYS.GAME_INFO);
  };

  const handleExitGame = () => {
    setScreen('home');
    setGameInfo(null);
    setGameState(null);
    updateUrl(null);
    sessionStorage.removeItem(STORAGE_KEYS.GAME_INFO);
  };

  // Clear lobby deleted message when user dismisses it
  const dismissLobbyDeletedMessage = () => {
    setLobbyDeletedMessage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {screen === 'home' && (
        <Home
          socket={socket}
          onGameCreated={handleGameCreated}
          onGameJoined={handleGameJoined}
          urlGameCode={urlGameCode}
          onUrlGameCodeCleared={() => setUrlGameCode(null)}
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

      {/* Connection overlay */}
      {showConnectionOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-foreground">
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium">Connecting to server...</span>
          </div>
        </div>
      )}

      {/* Lobby deleted notification */}
      {lobbyDeletedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={dismissLobbyDeletedMessage}>
          <Card className="w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <WarningCircle size={48} className="text-amber-500" />
              </div>
              <CardTitle>Lobby Closed</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {lobbyDeletedMessage}
              </p>
              <Button onClick={dismissLobbyDeletedMessage} className="w-full">
                OK
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
