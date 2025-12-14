const MonopolyGame = require('./gameEngine');

class GameRoom {
  constructor(gameId, hostSocketId, settings) {
    this.gameId = gameId;
    this.hostSocketId = hostSocketId;
    this.game = new MonopolyGame(gameId, settings);
    this.playerSockets = new Map(); // socketId -> playerId
    this.socketToPlayer = new Map(); // socketId -> player object
    this.isStarted = false;
    this.settings = settings;
  }

  // Add player to room
  addPlayer(socket, playerName) {
    if (this.isStarted) {
      throw new Error("Game already started");
    }

    if (this.game.players.length >= 6) {
      throw new Error("Game is full (max 6 players)");
    }

    const player = this.game.addPlayer({
      id: socket.id,
      name: playerName
    });

    this.playerSockets.set(socket.id, player.id);
    this.socketToPlayer.set(socket.id, player);

    return player;
  }

  // Remove player from room
  removePlayer(socketId) {
    const playerId = this.playerSockets.get(socketId);
    if (!playerId) return;

    if (!this.isStarted) {
      // Remove from game if not started
      this.game.players = this.game.players.filter(p => p.id !== playerId);
      this.playerSockets.delete(socketId);
      this.socketToPlayer.delete(socketId);

      // Transfer host if needed
      if (socketId === this.hostSocketId && this.game.players.length > 0) {
        this.hostSocketId = this.game.players[0].id;
      }
    } else {
      // Mark as disconnected but don't remove
      const player = this.game.getPlayer(playerId);
      if (player) {
        player.disconnected = true;
      }
    }
  }

  // Reconnect player
  reconnectPlayer(socket, playerId) {
    const player = this.game.getPlayer(playerId);
    if (!player) {
      throw new Error("Player not found in this game");
    }

    // Update socket mappings
    this.playerSockets.set(socket.id, playerId);
    this.socketToPlayer.set(socket.id, player);
    player.disconnected = false;

    return player;
  }

  // Start game
  startGame() {
    if (this.isStarted) {
      throw new Error("Game already started");
    }

    if (this.game.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    this.game.start();
    this.isStarted = true;
  }

  // Process action
  processAction(socketId, action, data) {
    const playerId = this.playerSockets.get(socketId);
    if (!playerId) {
      throw new Error("Player not in this game");
    }

    let result;

    try {
      switch (action) {
        case 'rollDice':
          result = this.game.rollDice(playerId);
          break;

        case 'buyProperty':
          this.game.buyProperty(playerId, data.propertyId);
          break;

        case 'declareProperty':
          this.game.declareProperty(playerId);
          break;

        case 'buildHouse':
          this.game.buildHouse(playerId, data.propertyId);
          break;

        case 'buildHotel':
          this.game.buildHotel(playerId, data.propertyId);
          break;

        case 'sellHouse':
          this.game.sellHouse(playerId, data.propertyId);
          break;

        case 'sellHotel':
          this.game.sellHotel(playerId, data.propertyId);
          break;

        case 'mortgage':
          this.game.mortgage(playerId, data.propertyId);
          break;

        case 'unmortgage':
          this.game.unmortgage(playerId, data.propertyId);
          break;

        case 'sellPropertyToBank':
          this.game.sellPropertyToBank(playerId, data.propertyId);
          break;

        case 'placeBid':
          this.game.placeBid(playerId, data.amount);
          break;

        case 'endAuction':
          this.game.endAuction(playerId);
          break;

        case 'proposeTrade':
          result = this.game.proposeTrade(playerId, data.toPlayerId, data.offer, data.request);
          break;

        case 'acceptTrade':
          this.game.acceptTrade(data.tradeId, playerId);
          break;

        case 'rejectTrade':
          this.game.rejectTrade(data.tradeId, playerId);
          break;

        case 'payJailFee':
          this.game.payJailFee(playerId);
          break;

        case 'useJailCard':
          this.game.useJailCard(playerId);
          break;

        case 'endTurn':
          this.game.endTurn(playerId);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return { success: true, result };
    } catch (error) {
      throw error;
    }
  }

  // Broadcast to all players in room
  broadcast(io, event, data) {
    this.playerSockets.forEach((playerId, socketId) => {
      io.to(socketId).emit(event, data);
    });
  }

  // Get game state
  getGameState() {
    return this.game.getGameState();
  }

  // Get player count
  getPlayerCount() {
    return this.game.players.length;
  }

  // Check if socket is host
  isHost(socketId) {
    return socketId === this.hostSocketId;
  }

  // Get all socket IDs in room
  getSocketIds() {
    return Array.from(this.playerSockets.keys());
  }
}

module.exports = GameRoom;
