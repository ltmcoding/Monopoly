# Tycoon

A real-time multiplayer property trading game with a modern dark-mode interface. Build your empire with friends online using customizable house rules.

## Features

**Complete Property Trading Experience**
- Full implementation of classic property trading rules
- Property buying, trading, and development
- Chance and Community Chest cards
- Jail mechanics with multiple escape options
- Automatic rent collection
- Bankruptcy and elimination

**Multiplayer**
- 2-8 players per game
- Real-time synchronization via WebSocket
- Session persistence (rejoin if disconnected)
- Room browser to find open games
- Game chat

**Customizable Rules**
- Auction mode for declined properties
- Starting cash ($500 - $5,000)
- Speed die for faster games
- No rent collection while in jail
- Free Parking jackpot
- Double salary for landing on GO
- Unlimited houses/hotels
- Even build requirements

**Modern Interface**
- Clean 2D board with property colors
- Dark mode glassmorphism design
- Player tokens with distinct colors
- Visual building indicators
- Trade proposal system
- Live auction bidding
- Game event log

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Radix UI |
| Backend | Node.js, Express, Socket.io |
| Icons | Phosphor Icons |
| Deployment | Docker, nginx |

## Architecture

```
┌─────────────┐     Socket.io      ┌─────────────┐
│   Client    │◄──────────────────►│   Server    │
│  (React)    │                    │  (Node.js)  │
└─────────────┘                    └──────┬──────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                    ┌──────────┐   ┌──────────┐   ┌──────────┐
                    │ server.js│   │ gameRoom │   │gameEngine│
                    │ (events) │   │ (rooms)  │   │ (logic)  │
                    └──────────┘   └──────────┘   └──────────┘
```

The server uses a three-layer architecture separating socket event handling, room management, and pure game logic.

## How It Works

1. **Create or Join** - Enter your name and create a new game or join with a code
2. **Configure** - Host sets house rules in the lobby
3. **Play** - Take turns rolling dice, buying properties, and building your empire
4. **Win** - Last player standing takes it all

## Game Controls

| Action | When Available |
|--------|----------------|
| Roll Dice | Your turn, rolling phase |
| Buy Property | Landed on unowned property |
| Build | Own complete color set, your turn |
| Trade | Anytime during your turn |
| Mortgage | Need cash, own properties |
| End Turn | Done with actions, didn't roll doubles |

## Documentation

Development and deployment guides are in the `md/` folder:
- Deployment with Docker
- GitHub auto-deploy setup
- Update workflow

## License

Educational project for personal use.
