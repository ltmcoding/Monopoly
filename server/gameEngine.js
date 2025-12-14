const { BOARD_SPACES, CHANCE_CARDS, COMMUNITY_CHEST_CARDS, COLOR_GROUPS } = require('./boardData');

class MonopolyGame {
  constructor(gameId, settings = {}) {
    this.gameId = gameId;

    // Game settings with defaults
    this.settings = {
      auctionMode: settings.auctionMode !== undefined ? settings.auctionMode : true,
      noRentInJail: settings.noRentInJail !== undefined ? settings.noRentInJail : false,
      mortgageMode: settings.mortgageMode !== undefined ? settings.mortgageMode : true,
      evenBuild: settings.evenBuild !== undefined ? settings.evenBuild : true,
      unlimitedProperties: settings.unlimitedProperties !== undefined ? settings.unlimitedProperties : false,
      startingCash: settings.startingCash || 1500,
      speedDie: settings.speedDie !== undefined ? settings.speedDie : false,
      doubleGoBonus: settings.doubleGoBonus !== undefined ? settings.doubleGoBonus : false
    };

    // Initialize game state
    this.players = [];
    this.properties = {};
    this.currentPlayerIndex = 0;
    this.phase = "waiting"; // waiting, rolling, buying, building, trading, auction, bankrupt, ended
    this.dice = null;
    this.doublesCount = 0;
    this.availableHouses = this.settings.unlimitedProperties ? Infinity : 32;
    this.availableHotels = this.settings.unlimitedProperties ? Infinity : 12;
    this.auction = null;
    this.trades = [];
    this.actionLog = [];
    this.chanceCards = this.shuffleCards([...CHANCE_CARDS]);
    this.communityChestCards = this.shuffleCards([...COMMUNITY_CHEST_CARDS]);
    this.pendingCardAction = null;
    this.lastDiceRoll = null;
    this.hasRolledThisTurn = false;
    this.hostId = null; // Set when first player joins

    // Initialize properties
    BOARD_SPACES.forEach(space => {
      if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
        this.properties[space.id] = {
          ownerId: null,
          houses: 0,
          hotels: 0,
          mortgaged: false
        };
      }
    });
  }

  // Utility: Shuffle cards
  shuffleCards(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Add player to game
  addPlayer(player) {
    if (this.phase !== "waiting") {
      throw new Error("Cannot add players after game has started");
    }

    const newPlayer = {
      id: player.id,
      name: player.name,
      position: 0,
      cash: this.settings.startingCash,
      properties: [],
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      color: player.color || this.getPlayerColor(this.players.length)
    };

    this.players.push(newPlayer);

    // First player becomes host
    if (this.players.length === 1) {
      this.hostId = newPlayer.id;
    }

    this.logAction('player_joined', newPlayer.id, {}, `${newPlayer.name} joined the game`);
    return newPlayer;
  }

  // Get player color based on index
  getPlayerColor(index) {
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    return colors[index % colors.length];
  }

  // Start the game
  start() {
    if (this.players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }
    this.phase = "rolling";
    this.logAction('game_started', null, {}, 'Game has started!');
  }

  // Roll dice
  rollDice(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) throw new Error("Player not found");
    if (this.getCurrentPlayer().id !== playerId) {
      throw new Error("Not your turn");
    }
    if (this.phase !== "rolling") {
      throw new Error("Cannot roll dice now");
    }

    // Roll regular dice
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const isDoubles = die1 === die2;

    let speedDieFace = null;
    if (this.settings.speedDie && player.position > 0) {
      // Speed die: 1, 2, 3, Mr. Monopoly, Mr. Monopoly, Bus
      const roll = Math.floor(Math.random() * 6);
      if (roll < 3) {
        speedDieFace = roll + 1; // 1, 2, or 3
      } else if (roll < 5) {
        speedDieFace = "Mr. Monopoly";
      } else {
        speedDieFace = "Bus";
      }
    }

    this.dice = speedDieFace !== null ? [die1, die2, speedDieFace] : [die1, die2];
    this.lastDiceRoll = die1 + die2;
    this.hasRolledThisTurn = true;

    // Handle jail
    if (player.inJail) {
      return this.handleJailRoll(player, isDoubles);
    }

    // Handle doubles
    if (isDoubles) {
      this.doublesCount++;
      if (this.doublesCount >= 3) {
        this.sendToJail(player);
        this.logAction('dice_rolled', playerId, { dice: this.dice, doubles: true, tripleDoubles: true },
          `${player.name} rolled triple doubles and went to jail!`);
        this.doublesCount = 0;
        this.phase = "rolling";
        return { jail: true, dice: this.dice };
      }
    } else {
      this.doublesCount = 0;
    }

    // Calculate movement
    let totalMove = die1 + die2;
    if (speedDieFace === "Bus") {
      // Player can choose either die
      totalMove = Math.max(die1, die2); // For now, auto-choose the higher value
    } else if (typeof speedDieFace === 'number') {
      totalMove += speedDieFace;
    }

    // Move player
    this.movePlayerBySpaces(player, totalMove);

    this.logAction('dice_rolled', playerId, { dice: this.dice, doubles: isDoubles },
      `${player.name} rolled ${this.dice.join(', ')}`);

    // Handle landing on space
    this.handleLanding(player);

    // Handle Speed Die Mr. Monopoly
    if (speedDieFace === "Mr. Monopoly") {
      this.handleMrMonopoly(player);
    }

    return {
      dice: this.dice,
      doubles: isDoubles,
      canRollAgain: isDoubles && this.phase === "rolling"
    };
  }

  // Handle jail roll
  handleJailRoll(player, isDoubles) {
    player.jailTurns++;

    if (isDoubles) {
      player.inJail = false;
      player.jailTurns = 0;
      const totalMove = this.dice[0] + this.dice[1];
      this.movePlayerBySpaces(player, totalMove);
      this.logAction('jail_released', player.id, { method: 'doubles' },
        `${player.name} rolled doubles and got out of jail!`);
      this.handleLanding(player);
      this.phase = "rolling"; // Turn ends after getting out
      return { outOfJail: true, dice: this.dice };
    } else if (player.jailTurns >= 3) {
      // Must pay $50 and move
      player.cash -= 50;
      player.inJail = false;
      player.jailTurns = 0;
      const totalMove = this.dice[0] + this.dice[1];
      this.movePlayerBySpaces(player, totalMove);
      this.logAction('jail_released', player.id, { method: 'forced_payment' },
        `${player.name} paid $50 after 3 turns and got out of jail`);
      this.handleLanding(player);
      this.phase = "rolling";
      return { forcedPayment: true, dice: this.dice };
    } else {
      this.logAction('jail_roll_failed', player.id, { turnsLeft: 3 - player.jailTurns },
        `${player.name} failed to roll doubles. ${3 - player.jailTurns} attempts remaining.`);
      this.phase = "rolling"; // Turn ends
      return { stillInJail: true, turnsLeft: 3 - player.jailTurns, dice: this.dice };
    }
  }

  // Pay jail fee
  payJailFee(playerId) {
    const player = this.getPlayer(playerId);
    if (!player.inJail) throw new Error("Not in jail");
    if (player.cash < 50) throw new Error("Insufficient funds");

    player.cash -= 50;
    player.inJail = false;
    player.jailTurns = 0;
    this.logAction('jail_released', playerId, { method: 'payment' }, `${player.name} paid $50 to get out of jail`);
    this.phase = "rolling";
  }

  // Use jail card
  useJailCard(playerId) {
    const player = this.getPlayer(playerId);
    if (!player.inJail) throw new Error("Not in jail");
    if (player.getOutOfJailCards <= 0) throw new Error("No jail cards");

    player.getOutOfJailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.logAction('jail_released', playerId, { method: 'card' }, `${player.name} used a Get Out of Jail Free card`);
    this.phase = "rolling";
  }

  // Send player to jail
  sendToJail(player) {
    player.position = 10; // Jail position
    player.inJail = true;
    player.jailTurns = 0;
    this.logAction('sent_to_jail', player.id, {}, `${player.name} was sent to jail`);
  }

  // Move player by number of spaces
  movePlayerBySpaces(player, spaces) {
    const oldPosition = player.position;
    player.position = (player.position + spaces) % 40;

    // Check if passed GO
    if (player.position < oldPosition || (oldPosition + spaces >= 40)) {
      player.cash += 200;
      this.logAction('passed_go', player.id, {}, `${player.name} passed GO and collected $200`);
    }
  }

  // Move player to specific space
  movePlayerToSpace(player, spaceId, collectGo = true) {
    const oldPosition = player.position;
    player.position = spaceId;

    // Check if passed GO
    if (collectGo && spaceId < oldPosition) {
      player.cash += 200;
      this.logAction('passed_go', player.id, {}, `${player.name} passed GO and collected $200`);
    }
  }

  // Handle landing on space
  handleLanding(player) {
    const space = BOARD_SPACES[player.position];

    switch (space.type) {
      case 'property':
      case 'railroad':
      case 'utility':
        this.handlePropertyLanding(player, space);
        break;
      case 'tax':
        this.handleTax(player, space);
        break;
      case 'chance':
        this.handleChance(player);
        break;
      case 'community_chest':
        this.handleCommunityChest(player);
        break;
      case 'go_to_jail':
        this.sendToJail(player);
        this.phase = "rolling";
        break;
      case 'go':
        // Bonus for landing directly on GO (if setting enabled)
        if (this.settings.doubleGoBonus) {
          player.cash += 100; // Extra $100 on top of the $200 from passing
          this.logAction('landed_on_go', player.id, { bonus: 100 }, `${player.name} landed on GO and collected $300!`);
        } else {
          this.logAction('landed_on_go', player.id, {}, `${player.name} landed on GO`);
        }
        this.phase = "rolling";
        break;
      default:
        this.phase = "rolling";
        break;
    }
  }

  // Handle property landing
  handlePropertyLanding(player, space) {
    const property = this.properties[space.id];

    if (!property.ownerId) {
      // Unowned property - offer to buy
      this.phase = "buying";
      this.logAction('landed_on_property', player.id, { propertyId: space.id },
        `${player.name} landed on ${space.name}`);
    } else if (property.ownerId === player.id) {
      // Own property
      this.phase = "rolling";
    } else if (!property.mortgaged) {
      // Owned by another player - collect rent
      this.collectRent(player.id, property.ownerId, space.id);
      this.phase = "rolling";
    } else {
      // Mortgaged property - no rent
      this.phase = "rolling";
    }
  }

  // Handle Mr. Monopoly (Speed Die)
  handleMrMonopoly(player) {
    // Find next unowned property or property where rent is owed
    for (let i = 1; i <= 40; i++) {
      const checkPos = (player.position + i) % 40;
      const space = BOARD_SPACES[checkPos];

      if ((space.type === 'property' || space.type === 'railroad' || space.type === 'utility')) {
        const property = this.properties[space.id];

        if (!property.ownerId) {
          // Unowned property
          this.movePlayerToSpace(player, checkPos, false);
          this.handleLanding(player);
          this.logAction('mr_monopoly', player.id, { propertyId: space.id },
            `Mr. Monopoly moved ${player.name} to ${space.name}`);
          return;
        } else if (property.ownerId !== player.id && !property.mortgaged) {
          // Owe rent
          this.movePlayerToSpace(player, checkPos, false);
          this.collectRent(player.id, property.ownerId, space.id);
          this.logAction('mr_monopoly', player.id, { propertyId: space.id },
            `Mr. Monopoly moved ${player.name} to ${space.name}`);
          return;
        }
      }
    }
  }

  // Handle tax
  handleTax(player, space) {
    player.cash -= space.amount;
    this.logAction('paid_tax', player.id, { amount: space.amount },
      `${player.name} paid $${space.amount} in ${space.name}`);

    if (player.cash < 0) {
      this.handleBankruptcy(player.id, null);
    }
    this.phase = "rolling";
  }

  // Handle Chance card
  handleChance(player) {
    const card = this.chanceCards.shift();
    this.chanceCards.push(card);

    this.logAction('drew_card', player.id, { card: card.text, type: 'chance' },
      `${player.name} drew Chance: ${card.text}`);

    this.executeCardAction(player, card);
  }

  // Handle Community Chest card
  handleCommunityChest(player) {
    const card = this.communityChestCards.shift();
    this.communityChestCards.push(card);

    this.logAction('drew_card', player.id, { card: card.text, type: 'community_chest' },
      `${player.name} drew Community Chest: ${card.text}`);

    this.executeCardAction(player, card);
  }

  // Execute card action
  executeCardAction(player, card) {
    switch (card.action) {
      case 'moveToSpace':
        this.movePlayerToSpace(player, card.data.space, card.data.collectGo);
        this.handleLanding(player);
        break;
      case 'collectMoney':
        player.cash += card.data.amount;
        this.phase = "rolling";
        break;
      case 'payMoney':
        player.cash -= card.data.amount;
        if (player.cash < 0) {
          this.handleBankruptcy(player.id, null);
        }
        this.phase = "rolling";
        break;
      case 'getOutOfJailFree':
        player.getOutOfJailCards++;
        this.phase = "rolling";
        break;
      case 'goToJail':
        this.sendToJail(player);
        this.phase = "rolling";
        break;
      case 'moveBackward':
        player.position = (player.position - card.data.spaces + 40) % 40;
        this.handleLanding(player);
        break;
      case 'moveToNearestRailroad':
        this.moveToNearestType(player, 'railroad', card.data.doubleRent);
        break;
      case 'moveToNearestUtility':
        this.moveToNearestUtility(player);
        break;
      case 'payRepairs':
        const { perHouse, perHotel } = card.data;
        let totalCost = 0;
        player.properties.forEach(propId => {
          const prop = this.properties[propId];
          totalCost += prop.houses * perHouse + prop.hotels * perHotel;
        });
        player.cash -= totalCost;
        if (player.cash < 0) {
          this.handleBankruptcy(player.id, null);
        }
        this.phase = "rolling";
        break;
      case 'payEachPlayer':
        this.players.forEach(p => {
          if (p.id !== player.id && !p.isBankrupt) {
            player.cash -= card.data.amount;
            p.cash += card.data.amount;
          }
        });
        if (player.cash < 0) {
          this.handleBankruptcy(player.id, null);
        }
        this.phase = "rolling";
        break;
      case 'collectFromEachPlayer':
        this.players.forEach(p => {
          if (p.id !== player.id && !p.isBankrupt) {
            p.cash -= card.data.amount;
            player.cash += card.data.amount;
            if (p.cash < 0) {
              this.handleBankruptcy(p.id, player.id);
            }
          }
        });
        this.phase = "rolling";
        break;
    }
  }

  // Move to nearest railroad/utility
  moveToNearestType(player, type, doubleRent = false) {
    const railroads = [5, 15, 25, 35];
    let nearest = null;
    let minDist = 40;

    railroads.forEach(pos => {
      const dist = (pos - player.position + 40) % 40;
      if (dist < minDist) {
        minDist = dist;
        nearest = pos;
      }
    });

    const oldPos = player.position;
    this.movePlayerToSpace(player, nearest, nearest < oldPos);
    this.handleLanding(player);
  }

  // Move to nearest utility
  moveToNearestUtility(player) {
    const utilities = [12, 28];
    let nearest = utilities[0];
    const dist1 = (utilities[0] - player.position + 40) % 40;
    const dist2 = (utilities[1] - player.position + 40) % 40;
    nearest = dist1 < dist2 ? utilities[0] : utilities[1];

    const oldPos = player.position;
    this.movePlayerToSpace(player, nearest, nearest < oldPos);

    const space = BOARD_SPACES[nearest];
    const property = this.properties[space.id];

    if (property.ownerId && property.ownerId !== player.id) {
      // Pay 10x dice roll
      const rent = this.lastDiceRoll * 10;
      player.cash -= rent;
      const owner = this.getPlayer(property.ownerId);
      owner.cash += rent;
      this.logAction('rent_collected', player.id, { toPlayerId: property.ownerId, amount: rent },
        `${player.name} paid $${rent} rent to ${owner.name}`);

      if (player.cash < 0) {
        this.handleBankruptcy(player.id, property.ownerId);
      }
    }
    this.phase = "rolling";
  }

  // Collect rent
  collectRent(fromPlayerId, toPlayerId, propertyId) {
    const fromPlayer = this.getPlayer(fromPlayerId);
    const toPlayer = this.getPlayer(toPlayerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    // Check no rent in jail setting
    if (this.settings.noRentInJail && toPlayer.inJail) {
      this.logAction('no_rent_jail', fromPlayerId, { propertyId },
        `No rent collected - ${toPlayer.name} is in jail`);
      return;
    }

    let rent = 0;

    if (space.type === 'property') {
      const colorGroup = Object.keys(COLOR_GROUPS).find(color =>
        COLOR_GROUPS[color].includes(propertyId)
      );
      const ownsSet = COLOR_GROUPS[colorGroup].every(id =>
        this.properties[id].ownerId === toPlayerId
      );

      if (property.hotels > 0) {
        rent = space.rent[5]; // Hotel rent
      } else if (property.houses > 0) {
        rent = space.rent[property.houses]; // House rent (1-4)
      } else if (ownsSet) {
        rent = space.rent[0] * 2; // Double base rent for owning complete color set
      } else {
        rent = space.rent[0]; // Base rent
      }
    } else if (space.type === 'railroad') {
      const railroadCount = toPlayer.properties.filter(id =>
        BOARD_SPACES.find(s => s.id === id).type === 'railroad'
      ).length;
      rent = space.rent[railroadCount - 1];
    } else if (space.type === 'utility') {
      const utilityCount = toPlayer.properties.filter(id =>
        BOARD_SPACES.find(s => s.id === id).type === 'utility'
      ).length;
      const multiplier = utilityCount === 1 ? 4 : 10;
      rent = this.lastDiceRoll * multiplier;
    }

    fromPlayer.cash -= rent;
    toPlayer.cash += rent;

    this.logAction('rent_collected', fromPlayerId, { toPlayerId, amount: rent, propertyId },
      `${fromPlayer.name} paid $${rent} rent to ${toPlayer.name} for ${space.name}`);

    if (fromPlayer.cash < 0) {
      this.handleBankruptcy(fromPlayerId, toPlayerId);
    }
  }

  // Buy property
  buyProperty(playerId, propertyId) {
    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (this.phase !== "buying") throw new Error("Cannot buy now");
    if (player.position !== space.position) throw new Error("Not on that property");
    if (property.ownerId) throw new Error("Property already owned");
    if (player.cash < space.price) throw new Error("Insufficient funds");

    player.cash -= space.price;
    property.ownerId = player.id;
    player.properties.push(propertyId);

    this.logAction('property_bought', playerId, { propertyId, price: space.price },
      `${player.name} bought ${space.name} for $${space.price}`);

    this.phase = "rolling";
  }

  // Decline property purchase
  declareProperty(playerId) {
    const player = this.getPlayer(playerId);
    if (this.phase !== "buying") throw new Error("No property to decline");

    const space = BOARD_SPACES[player.position];
    this.logAction('property_declined', playerId, { propertyId: space.id },
      `${player.name} declined to buy ${space.name}`);

    if (this.settings.auctionMode) {
      this.startAuction(space.id);
    } else {
      this.phase = "rolling";
    }
  }

  // Start auction
  startAuction(propertyId) {
    this.auction = {
      active: true,
      propertyId: propertyId,
      currentBid: 0,
      currentBidder: null,
      bids: []
    };
    this.phase = "auction";

    const space = BOARD_SPACES.find(s => s.id === propertyId);
    this.logAction('auction_started', null, { propertyId }, `Auction started for ${space.name}`);
  }

  // Place bid
  placeBid(playerId, amount) {
    if (this.phase !== "auction") throw new Error("No active auction");

    const player = this.getPlayer(playerId);
    if (player.isBankrupt) throw new Error("Bankrupt players cannot bid");
    if (amount <= this.auction.currentBid) throw new Error("Bid must be higher than current bid");
    if (amount > player.cash) throw new Error("Insufficient funds");

    this.auction.currentBid = amount;
    this.auction.currentBidder = playerId;
    this.auction.bids.push({ playerId, amount, timestamp: Date.now() });

    this.logAction('bid_placed', playerId, { amount }, `${player.name} bid $${amount}`);
  }

  // End auction (only host or current player can end)
  endAuction(playerId) {
    if (!this.auction || !this.auction.active) throw new Error("No active auction");
    if (playerId !== this.hostId && playerId !== this.getCurrentPlayer().id) {
      throw new Error("Only the host or current player can end the auction");
    }

    if (this.auction.currentBidder) {
      const winner = this.getPlayer(this.auction.currentBidder);
      const property = this.properties[this.auction.propertyId];
      const space = BOARD_SPACES.find(s => s.id === this.auction.propertyId);

      winner.cash -= this.auction.currentBid;
      property.ownerId = winner.id;
      winner.properties.push(this.auction.propertyId);

      this.logAction('auction_ended', this.auction.currentBidder,
        { propertyId: this.auction.propertyId, amount: this.auction.currentBid },
        `${winner.name} won ${space.name} for $${this.auction.currentBid}`);
    } else {
      const space = BOARD_SPACES.find(s => s.id === this.auction.propertyId);
      this.logAction('auction_ended', null, { propertyId: this.auction.propertyId },
        `No bids for ${space.name}`);
    }

    this.auction = null;
    this.phase = "rolling";
  }

  // Build house
  buildHouse(playerId, propertyId) {
    const player = this.getPlayer(playerId);
    if (this.getCurrentPlayer().id !== playerId) throw new Error("Not your turn");
    if (this.settings.noRentInJail && player.inJail) throw new Error("Cannot build while in jail");

    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (space.type !== 'property') throw new Error("Can only build on properties");
    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.mortgaged) throw new Error("Cannot build on mortgaged property");
    if (property.hotels > 0) throw new Error("Already has a hotel");
    if (property.houses >= 4) throw new Error("Maximum houses reached");

    // Check if owns complete color set
    const colorGroup = Object.keys(COLOR_GROUPS).find(color =>
      COLOR_GROUPS[color].includes(propertyId)
    );
    const ownsSet = COLOR_GROUPS[colorGroup].every(id =>
      this.properties[id].ownerId === playerId
    );
    if (!ownsSet) throw new Error("Must own complete color set");

    // Check no properties in set are mortgaged
    const anyMortgaged = COLOR_GROUPS[colorGroup].some(id =>
      this.properties[id].mortgaged
    );
    if (anyMortgaged) throw new Error("Cannot build while properties in set are mortgaged");

    // Check even build rule
    if (this.settings.evenBuild) {
      const maxHouses = Math.max(...COLOR_GROUPS[colorGroup].map(id =>
        this.properties[id].houses
      ));
      if (property.houses >= maxHouses) {
        throw new Error("Must build evenly across color set");
      }
    }

    // Check availability
    if (this.availableHouses <= 0) throw new Error("No houses available");

    // Check funds
    if (player.cash < space.houseCost) throw new Error("Insufficient funds");

    player.cash -= space.houseCost;
    property.houses++;
    this.availableHouses--;

    this.logAction('house_built', playerId, { propertyId },
      `${player.name} built a house on ${space.name}`);
  }

  // Build hotel
  buildHotel(playerId, propertyId) {
    const player = this.getPlayer(playerId);
    if (this.getCurrentPlayer().id !== playerId) throw new Error("Not your turn");
    if (this.settings.noRentInJail && player.inJail) throw new Error("Cannot build while in jail");

    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (space.type !== 'property') throw new Error("Can only build on properties");
    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.mortgaged) throw new Error("Cannot build on mortgaged property");
    if (property.hotels > 0) throw new Error("Already has a hotel");
    if (property.houses !== 4) throw new Error("Need 4 houses before building hotel");

    // Check complete set has 4 houses each
    const colorGroup = Object.keys(COLOR_GROUPS).find(color =>
      COLOR_GROUPS[color].includes(propertyId)
    );
    const allHave4Houses = COLOR_GROUPS[colorGroup].every(id =>
      this.properties[id].houses === 4
    );
    if (!allHave4Houses) throw new Error("All properties in set must have 4 houses");

    // Check availability
    if (this.availableHotels <= 0) throw new Error("No hotels available");

    // Check funds
    if (player.cash < space.hotelCost) throw new Error("Insufficient funds");

    player.cash -= space.hotelCost;
    property.houses = 0;
    property.hotels = 1;
    this.availableHouses += 4; // Return houses to bank
    this.availableHotels--;

    this.logAction('hotel_built', playerId, { propertyId },
      `${player.name} built a hotel on ${space.name}`);
  }

  // Sell house
  sellHouse(playerId, propertyId) {
    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.houses === 0) throw new Error("No houses to sell");

    // Check even build rule
    if (this.settings.evenBuild) {
      const colorGroup = Object.keys(COLOR_GROUPS).find(color =>
        COLOR_GROUPS[color].includes(propertyId)
      );
      const minHouses = Math.min(...COLOR_GROUPS[colorGroup].map(id =>
        this.properties[id].houses
      ));
      if (property.houses <= minHouses) {
        throw new Error("Must sell evenly across color set");
      }
    }

    player.cash += Math.floor(space.houseCost / 2);
    property.houses--;
    this.availableHouses++;

    this.logAction('house_sold', playerId, { propertyId, amount: Math.floor(space.houseCost / 2) },
      `${player.name} sold a house on ${space.name} for $${Math.floor(space.houseCost / 2)}`);
  }

  // Sell hotel
  sellHotel(playerId, propertyId) {
    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.hotels === 0) throw new Error("No hotel to sell");

    // Check if 4 houses are available to exchange
    if (this.availableHouses < 4) throw new Error("Not enough houses available to downgrade hotel");

    player.cash += Math.floor(space.hotelCost / 2);
    property.hotels = 0;
    property.houses = 4;
    this.availableHotels++;
    this.availableHouses -= 4;

    this.logAction('hotel_sold', playerId, { propertyId, amount: Math.floor(space.hotelCost / 2) },
      `${player.name} sold hotel on ${space.name} for $${Math.floor(space.hotelCost / 2)}`);
  }

  // Mortgage property
  mortgage(playerId, propertyId) {
    if (!this.settings.mortgageMode) throw new Error("Mortgage mode is disabled");

    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.mortgaged) throw new Error("Already mortgaged");
    if (property.houses > 0 || property.hotels > 0) {
      throw new Error("Must sell all buildings before mortgaging");
    }

    player.cash += space.mortgageValue;
    property.mortgaged = true;

    this.logAction('property_mortgaged', playerId, { propertyId, amount: space.mortgageValue },
      `${player.name} mortgaged ${space.name} for $${space.mortgageValue}`);
  }

  // Unmortgage property
  unmortgage(playerId, propertyId) {
    if (!this.settings.mortgageMode) throw new Error("Mortgage mode is disabled");

    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (!property.mortgaged) throw new Error("Not mortgaged");

    const cost = Math.floor(space.mortgageValue * 1.1);
    if (player.cash < cost) throw new Error("Insufficient funds");

    player.cash -= cost;
    property.mortgaged = false;

    this.logAction('property_unmortgaged', playerId, { propertyId, amount: cost },
      `${player.name} unmortgaged ${space.name} for $${cost}`);
  }

  // Sell property to bank (when mortgage mode off)
  sellPropertyToBank(playerId, propertyId) {
    if (this.settings.mortgageMode) throw new Error("Use mortgage instead");

    const player = this.getPlayer(playerId);
    const space = BOARD_SPACES.find(s => s.id === propertyId);
    const property = this.properties[propertyId];

    if (property.ownerId !== playerId) throw new Error("You don't own this property");
    if (property.houses > 0 || property.hotels > 0) {
      throw new Error("Must sell all buildings first");
    }

    const sellPrice = Math.floor(space.price / 2);
    player.cash += sellPrice;
    property.ownerId = null;
    player.properties = player.properties.filter(id => id !== propertyId);

    this.logAction('property_sold_to_bank', playerId, { propertyId, amount: sellPrice },
      `${player.name} sold ${space.name} to the bank for $${sellPrice}`);
  }

  // Propose trade
  proposeTrade(fromPlayerId, toPlayerId, offer, request) {
    const trade = {
      id: `trade_${Date.now()}_${Math.random()}`,
      fromPlayerId,
      toPlayerId,
      offer, // { cash, properties, jailCards }
      request, // { cash, properties, jailCards }
      status: "pending"
    };

    this.trades.push(trade);

    const fromPlayer = this.getPlayer(fromPlayerId);
    const toPlayer = this.getPlayer(toPlayerId);

    this.logAction('trade_proposed', fromPlayerId, { tradeId: trade.id, toPlayerId },
      `${fromPlayer.name} proposed a trade to ${toPlayer.name}`);

    return trade;
  }

  // Accept trade
  acceptTrade(tradeId, acceptingPlayerId) {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error("Trade not found");
    if (trade.status !== "pending") throw new Error("Trade already resolved");
    if (trade.toPlayerId !== acceptingPlayerId) throw new Error("Not your trade to accept");

    const fromPlayer = this.getPlayer(trade.fromPlayerId);
    const toPlayer = this.getPlayer(trade.toPlayerId);

    // Validate both players can afford
    if (fromPlayer.cash < trade.offer.cash) throw new Error("Offering player has insufficient funds");
    if (toPlayer.cash < trade.request.cash) throw new Error("Requesting player has insufficient funds");

    // Execute trade
    fromPlayer.cash -= trade.offer.cash;
    fromPlayer.cash += trade.request.cash;
    toPlayer.cash += trade.offer.cash;
    toPlayer.cash -= trade.request.cash;

    // Transfer properties
    trade.offer.properties.forEach(propId => {
      const property = this.properties[propId];
      property.ownerId = toPlayer.id;
      fromPlayer.properties = fromPlayer.properties.filter(id => id !== propId);
      toPlayer.properties.push(propId);
    });

    trade.request.properties.forEach(propId => {
      const property = this.properties[propId];
      property.ownerId = fromPlayer.id;
      toPlayer.properties = toPlayer.properties.filter(id => id !== propId);
      fromPlayer.properties.push(propId);
    });

    // Transfer jail cards
    fromPlayer.getOutOfJailCards -= trade.offer.jailCards || 0;
    fromPlayer.getOutOfJailCards += trade.request.jailCards || 0;
    toPlayer.getOutOfJailCards += trade.offer.jailCards || 0;
    toPlayer.getOutOfJailCards -= trade.request.jailCards || 0;

    trade.status = "accepted";

    this.logAction('trade_completed', trade.toPlayerId, { tradeId },
      `${toPlayer.name} accepted trade with ${fromPlayer.name}`);
  }

  // Reject trade
  rejectTrade(tradeId, rejectingPlayerId) {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error("Trade not found");
    if (trade.status !== "pending") throw new Error("Trade already resolved");
    if (trade.toPlayerId !== rejectingPlayerId) throw new Error("Not your trade to reject");

    trade.status = "rejected";

    const toPlayer = this.getPlayer(trade.toPlayerId);
    const fromPlayer = this.getPlayer(trade.fromPlayerId);

    this.logAction('trade_rejected', trade.toPlayerId, { tradeId },
      `${toPlayer.name} rejected trade from ${fromPlayer.name}`);
  }

  // Handle bankruptcy
  handleBankruptcy(playerId, creditorId) {
    const player = this.getPlayer(playerId);
    player.isBankrupt = true;

    if (creditorId) {
      // Transfer all assets to creditor
      const creditor = this.getPlayer(creditorId);

      creditor.cash += Math.max(0, player.cash);
      creditor.getOutOfJailCards += player.getOutOfJailCards;

      player.properties.forEach(propId => {
        const property = this.properties[propId];
        property.ownerId = creditorId;
        creditor.properties.push(propId);
      });

      this.logAction('player_bankrupt', playerId, { creditorId },
        `${player.name} went bankrupt. Assets transferred to ${creditor.name}`);
    } else {
      // Assets return to bank
      player.properties.forEach(propId => {
        const property = this.properties[propId];

        // Sell buildings
        property.houses = 0;
        property.hotels = 0;

        // Unmortgage
        property.mortgaged = false;
        property.ownerId = null;
      });

      this.logAction('player_bankrupt', playerId, {},
        `${player.name} went bankrupt. Assets returned to bank`);
    }

    player.cash = 0;
    player.properties = [];
    player.getOutOfJailCards = 0;

    // Check for winner
    const activePlayers = this.players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1) {
      this.phase = "ended";
      this.logAction('game_ended', activePlayers[0].id, {},
        `${activePlayers[0].name} wins!`);
    }
  }

  // End turn
  endTurn(playerId) {
    if (this.getCurrentPlayer().id !== playerId) throw new Error("Not your turn");
    if (this.phase === "buying" || this.phase === "auction") {
      throw new Error("Must complete current action");
    }
    if (!this.hasRolledThisTurn) {
      throw new Error("Must roll dice before ending turn");
    }

    this.doublesCount = 0;
    this.hasRolledThisTurn = false;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

    // Skip bankrupt players
    while (this.getCurrentPlayer().isBankrupt && this.phase !== "ended") {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    this.phase = "rolling";

    const nextPlayer = this.getCurrentPlayer();
    this.logAction('turn_ended', playerId, { nextPlayerId: nextPlayer.id },
      `${nextPlayer.name}'s turn`);
  }

  // Get current player
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  // Validate action
  validateAction(playerId, action, data) {
    // Basic validation logic
    const player = this.getPlayer(playerId);
    if (!player) return { valid: false, error: "Player not found" };
    if (player.isBankrupt) return { valid: false, error: "Player is bankrupt" };

    return { valid: true };
  }

  // Get game state
  getGameState() {
    return {
      gameId: this.gameId,
      settings: this.settings,
      players: this.players,
      properties: this.properties,
      currentPlayerIndex: this.currentPlayerIndex,
      phase: this.phase,
      dice: this.dice,
      doublesCount: this.doublesCount,
      availableHouses: this.availableHouses,
      availableHotels: this.availableHotels,
      auction: this.auction,
      trades: this.trades,
      actionLog: this.actionLog.slice(-20), // Last 20 actions
      hasRolledThisTurn: this.hasRolledThisTurn,
      hostId: this.hostId
    };
  }

  // Log action
  logAction(type, playerId, data, message) {
    this.actionLog.push({
      type,
      playerId,
      timestamp: Date.now(),
      data,
      message
    });
  }
}

module.exports = MonopolyGame;
