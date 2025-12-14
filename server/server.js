const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const GameRoom = require('./gameRoom');
const { BOARD_SPACES } = require('./boardData');

const app = express();
const server = http.createServer(app);

// Configure CORS - allow multiple origins for dev and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://monopoly.ltmcoding.dev',
  process.env.CLIENT_URL
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow anyway for now to debug
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  // Use websocket only to avoid polling CORS issues
  transports: ['websocket'],
  // Keep connections alive with ping/pong
  pingTimeout: 60000,
  pingInterval: 25000,
  // Prevent compression issues
  perMessageDeflate: false,
  // Allow upgrades
  allowUpgrades: false
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow anyway for now
    }
  },
  credentials: true
}));
app.use(express.json());

// Store active games (in production, use Redis)
const games = new Map();

// Store pending deletions (for grace period on disconnect)
const pendingDeletions = new Map();

// Utility: Generate game ID
function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return games.has(id) ? generateGameId() : id;
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}, total clients: ${io.engine.clientsCount}`);

  // Get list of available games (for room browser)
  socket.on('getGamesList', (callback) => {
    try {
      console.log(`[getGamesList] Request from socket ${socket.id}, total games: ${games.size}`);

      const gamesList = [];
      games.forEach((gameRoom, gameId) => {
        console.log(`[getGamesList] Checking game ${gameId}: isStarted=${gameRoom.isStarted}, players=${gameRoom.getPlayerCount()}`);
        // Only show games that haven't started yet
        if (!gameRoom.isStarted) {
          const hostPlayer = gameRoom.game.players[0];
          gamesList.push({
            gameId,
            hostName: hostPlayer?.name || 'Unknown',
            playerCount: gameRoom.getPlayerCount(),
            maxPlayers: 6,
            settings: gameRoom.game.settings
          });
        }
      });

      console.log(`[getGamesList] Returning ${gamesList.length} games`);

      if (callback) {
        callback({ success: true, games: gamesList });
      }
    } catch (error) {
      console.error('[getGamesList] Error:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Find and join next available game, or create one
  socket.on('quickPlay', ({ playerName, settings }, callback) => {
    try {
      console.log(`[quickPlay] Request from ${playerName}, socket ${socket.id}`);
      console.log(`[quickPlay] Current games: ${games.size}`);

      // Find first joinable game
      let targetGameId = null;
      games.forEach((gameRoom, gameId) => {
        if (!gameRoom.isStarted && gameRoom.getPlayerCount() < 6 && !targetGameId) {
          targetGameId = gameId;
        }
      });

      if (targetGameId) {
        // Join existing game
        console.log(`[quickPlay] Joining existing game ${targetGameId}`);
        const gameRoom = games.get(targetGameId);
        const player = gameRoom.addPlayer(socket, playerName);
        socket.join(targetGameId);
        socket.gameId = targetGameId;

        gameRoom.broadcast(io, 'playerJoined', {
          player,
          gameState: gameRoom.getGameState()
        });

        if (callback) {
          callback({
            success: true,
            gameId: targetGameId,
            player,
            gameState: gameRoom.getGameState(),
            isHost: false,
            created: false
          });
        }
      } else {
        // Create new game
        const gameId = generateGameId();
        console.log(`[quickPlay] Creating new game ${gameId}`);
        const gameRoom = new GameRoom(gameId, socket.id, settings);
        games.set(gameId, gameRoom);

        const player = gameRoom.addPlayer(socket, playerName);
        socket.join(gameId);
        socket.gameId = gameId;

        console.log(`[quickPlay] Game ${gameId} created, total games: ${games.size}`);

        if (callback) {
          callback({
            success: true,
            gameId,
            player,
            gameState: gameRoom.getGameState(),
            isHost: true,
            created: true
          });
        }
      }
    } catch (error) {
      console.error('[quickPlay] Error:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Update game settings (host only, before game starts)
  socket.on('updateSettings', ({ gameId, settings }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');
      if (!gameRoom.isHost(socket.id)) throw new Error('Only host can update settings');
      if (gameRoom.isStarted) throw new Error('Cannot change settings after game started');

      // Update settings
      gameRoom.game.settings = { ...gameRoom.game.settings, ...settings };

      // Notify all players
      gameRoom.broadcast(io, 'settingsUpdated', {
        settings: gameRoom.game.settings,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Change player color (before game starts)
  socket.on('changePlayerColor', ({ gameId, color }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');
      if (gameRoom.isStarted) throw new Error('Cannot change color after game started');

      const playerId = gameRoom.playerSockets.get(socket.id);
      if (!playerId) throw new Error('Player not found');

      // Check if color is already taken
      const colorTaken = gameRoom.game.players.some(p => p.color === color && p.id !== playerId);
      if (colorTaken) throw new Error('Color already taken');

      // Update player color
      const player = gameRoom.game.getPlayer(playerId);
      if (player) {
        player.color = color;
      }

      // Notify all players
      gameRoom.broadcast(io, 'playerColorChanged', {
        playerId,
        color,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error changing color:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Create new game
  socket.on('createGame', (settings, callback) => {
    try {
      const gameId = generateGameId();
      const gameRoom = new GameRoom(gameId, socket.id, settings);

      games.set(gameId, gameRoom);

      console.log(`Game created: ${gameId}`);
      console.log(`Active games: ${Array.from(games.keys()).join(', ')}`);

      if (callback) {
        callback({
          success: true,
          gameId,
          gameState: gameRoom.getGameState()
        });
      }
    } catch (error) {
      console.error('Error creating game:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Join game
  socket.on('joinGame', ({ gameId, playerName }, callback) => {
    try {
      console.log(`Join attempt - gameId: "${gameId}", playerName: "${playerName}"`);
      console.log(`Active games: ${Array.from(games.keys()).join(', ')}`);
      console.log(`Total games: ${games.size}`);

      const gameRoom = games.get(gameId);

      if (!gameRoom) {
        console.log(`Game not found: "${gameId}"`);
        throw new Error('Game not found');
      }

      console.log(`Game found: ${gameId}`);

      const player = gameRoom.addPlayer(socket, playerName);
      socket.join(gameId);
      socket.gameId = gameId;

      console.log(`${playerName} joined game ${gameId}`);

      // Notify all players
      gameRoom.broadcast(io, 'playerJoined', {
        player,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({
          success: true,
          player,
          gameState: gameRoom.getGameState(),
          isHost: gameRoom.isHost(socket.id)
        });
      }
    } catch (error) {
      console.error('Error joining game:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Leave game
  socket.on('leaveGame', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);

      if (!gameRoom) {
        throw new Error('Game not found');
      }

      gameRoom.removePlayer(socket.id);
      socket.leave(gameId);

      // Notify remaining players
      gameRoom.broadcast(io, 'playerLeft', {
        socketId: socket.id,
        gameState: gameRoom.getGameState()
      });

      // Delete game if empty
      if (gameRoom.getPlayerCount() === 0) {
        games.delete(gameId);
        console.log(`Game ${gameId} deleted (empty)`);
      }

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error('Error leaving game:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Start game
  socket.on('startGame', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);

      if (!gameRoom) {
        throw new Error('Game not found');
      }

      if (!gameRoom.isHost(socket.id)) {
        throw new Error('Only host can start game');
      }

      gameRoom.startGame();

      // Notify all players
      gameRoom.broadcast(io, 'gameStarted', {
        gameState: gameRoom.getGameState()
      });

      console.log(`Game ${gameId} started`);

      if (callback) {
        callback({
          success: true,
          gameState: gameRoom.getGameState()
        });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Roll dice
  socket.on('rollDice', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      const result = gameRoom.processAction(socket.id, 'rollDice', {});

      // Broadcast updated state
      gameRoom.broadcast(io, 'diceRolled', {
        result,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, result, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Buy property
  socket.on('buyProperty', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'buyProperty', { propertyId });

      gameRoom.broadcast(io, 'propertyBought', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error buying property:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Decline property
  socket.on('declareProperty', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'declareProperty', {});

      gameRoom.broadcast(io, 'propertyDeclined', {
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error declining property:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Build house
  socket.on('buildHouse', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'buildHouse', { propertyId });

      gameRoom.broadcast(io, 'houseBuilt', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error building house:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Build hotel
  socket.on('buildHotel', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'buildHotel', { propertyId });

      gameRoom.broadcast(io, 'hotelBuilt', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error building hotel:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Sell house
  socket.on('sellHouse', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'sellHouse', { propertyId });

      gameRoom.broadcast(io, 'houseSold', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error selling house:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Sell hotel
  socket.on('sellHotel', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'sellHotel', { propertyId });

      gameRoom.broadcast(io, 'hotelSold', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error selling hotel:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Mortgage property
  socket.on('mortgage', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'mortgage', { propertyId });

      gameRoom.broadcast(io, 'propertyMortgaged', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error mortgaging property:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Unmortgage property
  socket.on('unmortgage', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'unmortgage', { propertyId });

      gameRoom.broadcast(io, 'propertyUnmortgaged', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error unmortgaging property:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Sell property to bank
  socket.on('sellPropertyToBank', ({ gameId, propertyId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'sellPropertyToBank', { propertyId });

      gameRoom.broadcast(io, 'propertySoldToBank', {
        propertyId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error selling property to bank:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Place auction bid
  socket.on('placeBid', ({ gameId, amount }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'placeBid', { amount });

      gameRoom.broadcast(io, 'bidPlaced', {
        amount,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // End auction
  socket.on('endAuction', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'endAuction', {});

      gameRoom.broadcast(io, 'auctionEnded', {
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error ending auction:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Propose trade
  socket.on('proposeTrade', ({ gameId, toPlayerId, offer, request }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      const result = gameRoom.processAction(socket.id, 'proposeTrade', {
        toPlayerId,
        offer,
        request
      });

      gameRoom.broadcast(io, 'tradeProposed', {
        trade: result,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, trade: result, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error proposing trade:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Accept trade
  socket.on('acceptTrade', ({ gameId, tradeId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'acceptTrade', { tradeId });

      gameRoom.broadcast(io, 'tradeCompleted', {
        tradeId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error accepting trade:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Reject trade
  socket.on('rejectTrade', ({ gameId, tradeId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'rejectTrade', { tradeId });

      gameRoom.broadcast(io, 'tradeRejected', {
        tradeId,
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error rejecting trade:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Pay jail fee
  socket.on('payJailFee', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'payJailFee', {});

      gameRoom.broadcast(io, 'jailFeePaid', {
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error paying jail fee:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Use jail card
  socket.on('useJailCard', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'useJailCard', {});

      gameRoom.broadcast(io, 'jailCardUsed', {
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error using jail card:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // End turn
  socket.on('endTurn', ({ gameId }, callback) => {
    try {
      const gameRoom = games.get(gameId);
      if (!gameRoom) throw new Error('Game not found');

      gameRoom.processAction(socket.id, 'endTurn', {});

      gameRoom.broadcast(io, 'turnEnded', {
        gameState: gameRoom.getGameState()
      });

      if (callback) {
        callback({ success: true, gameState: gameRoom.getGameState() });
      }
    } catch (error) {
      console.error('Error ending turn:', error);
      socket.emit('error', { message: error.message });
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

    // Find game this socket was in
    const gameId = socket.gameId;
    if (gameId) {
      const gameRoom = games.get(gameId);
      if (gameRoom) {
        // Mark player as disconnected but don't remove immediately
        // Give them 30 seconds to reconnect
        const playerId = gameRoom.playerSockets.get(socket.id);

        if (playerId) {
          console.log(`Player ${playerId} disconnected from game ${gameId}, starting grace period`);

          // Set up deletion timer
          const deletionKey = `${gameId}:${socket.id}`;

          // Clear any existing timer for this player
          if (pendingDeletions.has(deletionKey)) {
            clearTimeout(pendingDeletions.get(deletionKey));
          }

          // Set new timer - 5 minute grace period
          const timer = setTimeout(() => {
            const currentGameRoom = games.get(gameId);
            if (currentGameRoom) {
              // Check if player is still disconnected (socket ID still mapped)
              if (currentGameRoom.playerSockets.has(socket.id)) {
                currentGameRoom.removePlayer(socket.id);
                console.log(`Player removed from game ${gameId} after grace period`);

                // Check if game should be deleted
                if (currentGameRoom.getPlayerCount() === 0 && !currentGameRoom.isStarted) {
                  // Notify via the game room before deleting (in case anyone reconnects)
                  currentGameRoom.broadcast(io, 'lobbyDeleted', {
                    reason: 'inactivity',
                    message: 'Lobby was deleted due to inactivity'
                  });
                  games.delete(gameId);
                  console.log(`Game ${gameId} deleted (empty after grace period)`);
                } else {
                  // Notify remaining players
                  currentGameRoom.broadcast(io, 'playerLeft', {
                    socketId: socket.id,
                    gameState: currentGameRoom.getGameState()
                  });
                }
              }
            }
            pendingDeletions.delete(deletionKey);
          }, 300000); // 5 minute grace period

          pendingDeletions.set(deletionKey, timer);
        }
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', games: games.size });
});

// Start server
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Monopoly server running on port ${PORT}`);
});
