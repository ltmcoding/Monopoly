import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3005';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
      setConnected(false);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Generic emit with callback
  const emit = (event, data = {}) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not initialized'));
        return;
      }

      // Allow emit even if connected state is briefly false (socket.io handles reconnection)
      // Only reject if the socket is truly disconnected
      if (!socketRef.current.connected && !socketRef.current.connecting) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Set a timeout in case the emit never gets a response
      const timeout = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, 10000);

      socketRef.current.emit(event, data, (response) => {
        clearTimeout(timeout);
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  };

  // Listen for events
  const on = (event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    // Store listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);
  };

  // Remove listener
  const off = (event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.off(event, callback);

    // Remove from stored listeners
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };

  // Game-specific methods
  const createGame = async (settings) => {
    return emit('createGame', settings);
  };

  const joinGame = async (gameId, playerName) => {
    return emit('joinGame', { gameId, playerName });
  };

  const getGamesList = async () => {
    return emit('getGamesList');
  };

  const quickPlay = async (playerName, settings) => {
    return emit('quickPlay', { playerName, settings });
  };

  const updateSettings = async (gameId, settings) => {
    return emit('updateSettings', { gameId, settings });
  };

  const changePlayerColor = async (gameId, color) => {
    return emit('changePlayerColor', { gameId, color });
  };

  const leaveGame = async (gameId) => {
    return emit('leaveGame', { gameId });
  };

  const startGame = async (gameId) => {
    return emit('startGame', { gameId });
  };

  const rollDice = async (gameId) => {
    return emit('rollDice', { gameId });
  };

  const buyProperty = async (gameId, propertyId) => {
    return emit('buyProperty', { gameId, propertyId });
  };

  const declareProperty = async (gameId) => {
    return emit('declareProperty', { gameId });
  };

  const buildHouse = async (gameId, propertyId) => {
    return emit('buildHouse', { gameId, propertyId });
  };

  const buildHotel = async (gameId, propertyId) => {
    return emit('buildHotel', { gameId, propertyId });
  };

  const sellHouse = async (gameId, propertyId) => {
    return emit('sellHouse', { gameId, propertyId });
  };

  const sellHotel = async (gameId, propertyId) => {
    return emit('sellHotel', { gameId, propertyId });
  };

  const mortgage = async (gameId, propertyId) => {
    return emit('mortgage', { gameId, propertyId });
  };

  const unmortgage = async (gameId, propertyId) => {
    return emit('unmortgage', { gameId, propertyId });
  };

  const sellPropertyToBank = async (gameId, propertyId) => {
    return emit('sellPropertyToBank', { gameId, propertyId });
  };

  const placeBid = async (gameId, amount) => {
    return emit('placeBid', { gameId, amount });
  };

  const endAuction = async (gameId) => {
    return emit('endAuction', { gameId });
  };

  const proposeTrade = async (gameId, toPlayerId, offer, request) => {
    return emit('proposeTrade', { gameId, toPlayerId, offer, request });
  };

  const acceptTrade = async (gameId, tradeId) => {
    return emit('acceptTrade', { gameId, tradeId });
  };

  const rejectTrade = async (gameId, tradeId) => {
    return emit('rejectTrade', { gameId, tradeId });
  };

  const payJailFee = async (gameId) => {
    return emit('payJailFee', { gameId });
  };

  const useJailCard = async (gameId) => {
    return emit('useJailCard', { gameId });
  };

  const endTurn = async (gameId) => {
    return emit('endTurn', { gameId });
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    on,
    off,
    emit,
    // Game methods
    createGame,
    joinGame,
    getGamesList,
    quickPlay,
    updateSettings,
    changePlayerColor,
    leaveGame,
    startGame,
    rollDice,
    buyProperty,
    declareProperty,
    buildHouse,
    buildHotel,
    sellHouse,
    sellHotel,
    mortgage,
    unmortgage,
    sellPropertyToBank,
    placeBid,
    endAuction,
    proposeTrade,
    acceptTrade,
    rejectTrade,
    payJailFee,
    useJailCard,
    endTurn
  };
}
