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

// Configure CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store active games (in production, use Redis)
const games = new Map();

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
  console.log(`Client connected: ${socket.id}`);

  // Create new game
  socket.on('createGame', (settings, callback) => {
    try {
      const gameId = generateGameId();
      const gameRoom = new GameRoom(gameId, socket.id, settings);

      games.set(gameId, gameRoom);

      console.log(`Game created: ${gameId}`);

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
      const gameRoom = games.get(gameId);

      if (!gameRoom) {
        throw new Error('Game not found');
      }

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

      gameRoom.broadcast(io, 'jailFeeP aid', {
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
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Find game this socket was in
    const gameId = socket.gameId;
    if (gameId) {
      const gameRoom = games.get(gameId);
      if (gameRoom) {
        gameRoom.removePlayer(socket.id);

        // Notify remaining players
        gameRoom.broadcast(io, 'playerLeft', {
          socketId: socket.id,
          gameState: gameRoom.getGameState()
        });

        // Delete game if empty and not started
        if (gameRoom.getPlayerCount() === 0 && !gameRoom.isStarted) {
          games.delete(gameId);
          console.log(`Game ${gameId} deleted (empty after disconnect)`);
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
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Monopoly server running on port ${PORT}`);
});
