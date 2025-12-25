const MonopolyGame = require('./gameEngine');

class GameRoom {
  constructor(gameId, hostSocketId, settings) {
    this.gameId = gameId;
    this.hostSocketId = hostSocketId;
    this.game = new MonopolyGame(gameId, settings);
    this.playerSockets = new Map(); // socketId -> playerId
    this.socketToPlayer = new Map(); // socketId -> player object
    this.sessionToPlayer = new Map(); // sessionId -> player object
    this.playerToSession = new Map(); // playerId -> sessionId
    this.isStarted = false;
    this.settings = settings;
    this.isPrivate = settings?.isPrivate || false;
    this.chatMessages = [];
    this.maxChatMessages = 50;
  }

  // Generate unique session ID
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  // Add a chat message from a player
  addChatMessage(playerId, playerName, playerColor, message) {
    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'player',
      playerId,
      playerName,
      playerColor,
      message,
      timestamp: Date.now()
    };

    this.chatMessages.push(chatMessage);
    if (this.chatMessages.length > this.maxChatMessages) {
      this.chatMessages = this.chatMessages.slice(-this.maxChatMessages);
    }

    return chatMessage;
  }

  // Add a system message (player joined, left, kicked)
  addSystemMessage(message) {
    const systemMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'system',
      message,
      timestamp: Date.now()
    };

    this.chatMessages.push(systemMessage);
    if (this.chatMessages.length > this.maxChatMessages) {
      this.chatMessages = this.chatMessages.slice(-this.maxChatMessages);
    }

    return systemMessage;
  }

  // Toggle privacy setting
  togglePrivacy() {
    this.isPrivate = !this.isPrivate;
    return this.isPrivate;
  }

  // Add player to room
  addPlayer(socket, playerName) {
    if (this.isStarted) {
      throw new Error("Game already started");
    }

    const maxPlayers = this.game.settings?.maxPlayers || 6;
    if (this.game.players.length >= maxPlayers) {
      throw new Error(`Game is full (max ${maxPlayers} players)`);
    }

    const sessionId = this.generateSessionId();
    const player = this.game.addPlayer({
      id: socket.id,
      name: playerName
    });

    this.playerSockets.set(socket.id, player.id);
    this.socketToPlayer.set(socket.id, player);
    this.sessionToPlayer.set(sessionId, player);
    this.playerToSession.set(player.id, sessionId);

    return { player, sessionId };
  }

  // Add bot to room
  addBot() {
    if (this.isStarted) {
      throw new Error("Game already started");
    }

    const maxPlayers = this.game.settings?.maxPlayers || 6;
    if (this.game.players.length >= maxPlayers) {
      throw new Error(`Game is full (max ${maxPlayers} players)`);
    }

    // Count existing bots to generate unique name
    const existingBots = this.game.players.filter(p => p.isBot).length;
    const botNumber = existingBots + 1;
    const botNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const botName = `Bot ${botNames[existingBots] || botNumber}`;

    // Generate unique bot ID
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const bot = this.game.addPlayer({
      id: botId,
      name: botName,
      isBot: true
    });

    return bot;
  }

  // Reconnect existing player with new socket
  reconnectPlayer(socket, sessionId) {
    const player = this.sessionToPlayer.get(sessionId);
    if (!player) {
      return null;
    }

    // Get old socket id
    const oldSocketId = player.id;

    // Update player's socket id
    player.id = socket.id;

    // Update mappings
    this.playerSockets.delete(oldSocketId);
    this.socketToPlayer.delete(oldSocketId);
    this.playerSockets.set(socket.id, player.id);
    this.socketToPlayer.set(socket.id, player);

    // Update host if this was the host
    if (this.hostSocketId === oldSocketId) {
      this.hostSocketId = socket.id;
    }

    // Update in game players array
    const gamePlayer = this.game.players.find(p => p.id === oldSocketId);
    if (gamePlayer) {
      gamePlayer.id = socket.id;
    }

    return player;
  }

  // Check if session exists
  hasSession(sessionId) {
    return this.sessionToPlayer.has(sessionId);
  }

  // Remove player from room
  removePlayer(socketId) {
    const playerId = this.playerSockets.get(socketId);
    if (!playerId) return null;

    const player = this.socketToPlayer.get(socketId);
    const playerName = player?.name || 'Unknown';

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

    return playerName;
  }

  // Kick a player (host only, lobby only)
  kickPlayer(targetSocketId) {
    if (this.isStarted) {
      throw new Error("Cannot kick players after game started");
    }

    const player = this.socketToPlayer.get(targetSocketId);
    if (!player) {
      throw new Error("Player not found");
    }

    const playerName = player.name;

    // Remove from game
    this.game.players = this.game.players.filter(p => p.id !== player.id);
    this.playerSockets.delete(targetSocketId);
    this.socketToPlayer.delete(targetSocketId);

    return { playerName, socketId: targetSocketId };
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
    return {
      ...this.game.getGameState(),
      chatMessages: this.chatMessages,
      isPrivate: this.isPrivate,
      maxPlayers: this.game.settings?.maxPlayers || 6,
      status: this.isStarted ? 'playing' : 'lobby'
    };
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
