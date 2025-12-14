# Monopoly - Multiplayer Online Game

A feature-complete multiplayer Monopoly implementation with customizable rules, real-time gameplay, and a clean 2D interface.

## 📖 Documentation

- 🚀 **[Production Deployment](DEPLOYMENT.md)** - Deploy on your server with Docker
- 🔄 **[GitHub Setup](GITHUB-SETUP.md)** - Connect to GitHub and auto-deploy
- ⚡ **[Quick Update Guide](UPDATE-GUIDE.md)** - How to push updates to your live server

## Features

- **Multiplayer Support**: 2-6 players can join and play together in real-time
- **Customizable Rules**: Toggle various game settings to match your preferred play style
- **Complete Game Logic**: All official Monopoly rules implemented including:
  - Property buying, building, and management
  - Auctions
  - Trading between players
  - Jail mechanics
  - Chance and Community Chest cards
  - Bankruptcy handling
  - And more!
- **Real-time Synchronization**: Socket.io ensures all players see updates instantly
- **Clean 2D Board**: Easy-to-read board with visual indicators for properties, buildings, and players
- **Responsive Design**: Works on desktop and tablet devices

## Game Settings

All settings can be configured when creating a game:

- **Auction Mode** (default: ON) - Properties are auctioned when declined
- **No Rent in Jail** (default: OFF) - Jailed players cannot collect rent
- **Mortgage Mode** (default: ON) - Enable property mortgaging
- **Even Build** (default: ON) - Must build houses evenly across color sets
- **Unlimited Properties** (default: OFF) - No limit on houses/hotels (32 houses, 12 hotels when OFF)
- **Starting Cash** (default: $1500) - Adjustable from $500 to $5000
- **Speed Die** (default: OFF) - Add a third die for faster gameplay

See `monopoly-complete-rules.md` for detailed rules documentation.

## Tech Stack

### Backend
- Node.js + Express
- Socket.io (real-time communication)
- In-memory game state (Redis-ready for production)

### Frontend
- React 18
- Socket.io-client
- CSS3 (no external UI frameworks)

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd Monopoly
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

## Running the Game

### Option 1: Development Mode (Recommended for Testing)

**Terminal 1 - Start the Server:**
```bash
cd server
npm start
```
Server will run on http://localhost:3005

**Terminal 2 - Start the Client:**
```bash
cd client
npm start
```
Client will run on http://localhost:3000 and open automatically in your browser.

### Option 2: Production Build

**Build the client:**
```bash
cd client
npm run build
```

**Serve both from the server:**
You'll need to configure the server to serve the built React files. For now, use development mode.

## How to Play

### Starting a Game

1. **Create a Game:**
   - Open http://localhost:3000
   - Enter your name
   - Click "Create New Game"
   - Configure game settings
   - Click "Create Game"
   - Share the 6-character game code with friends

2. **Join a Game:**
   - Enter your name
   - Enter the game code
   - Click "Join Game"

3. **Start Playing:**
   - Host clicks "Start Game" when all players have joined
   - Players take turns rolling dice, buying properties, and building
   - Last player remaining wins!

### Game Controls

- **Roll Dice**: Click when it's your turn and phase is "rolling"
- **Buy Property**: Appears when you land on an unowned property
- **Decline Property**: Pass on purchasing (triggers auction if enabled)
- **Build House/Hotel**: Available on your turn when you own a complete color set
- **Mortgage**: Click on properties in the action panel to mortgage for cash
- **Trade**: Click "Propose Trade" to trade cash, properties, or jail cards with other players
- **End Turn**: Available when you're done with your turn and haven't rolled doubles

### Game Flow

1. Roll dice to move
2. Land on spaces and execute actions (buy property, pay rent, draw cards, etc.)
3. On your turn, you can build houses/hotels, mortgage properties, or trade
4. Roll doubles to go again (but 3 doubles in a row sends you to jail!)
5. Manage your money wisely to avoid bankruptcy
6. Last player standing wins

## Project Structure

```
Monopoly/
├── server/
│   ├── package.json
│   ├── server.js           # Express + Socket.io server
│   ├── gameEngine.js       # Core game logic
│   ├── gameRoom.js         # Game room management
│   └── boardData.js        # Board spaces, cards, property data
│
├── client/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.jsx         # Main app component
│       ├── components/     # React components
│       │   ├── Home.jsx
│       │   ├── Lobby.jsx
│       │   ├── Game.jsx
│       │   ├── Board2D.jsx
│       │   ├── PlayerPanel.jsx
│       │   ├── ActionPanel.jsx
│       │   ├── PropertyCard.jsx
│       │   ├── TradeModal.jsx
│       │   ├── AuctionModal.jsx
│       │   └── GameLog.jsx
│       ├── hooks/
│       │   └── useSocket.js
│       ├── utils/
│       │   ├── boardData.js
│       │   └── formatters.js
│       └── styles/
│           └── App.css
│
├── monopoly-complete-rules.md
├── monopoly-tech-implementation-plan.md
└── README.md
```

## Game Rules

For complete game rules and setting explanations, see `monopoly-complete-rules.md`.

Key mechanics:
- **Rent is automatic** - Collected immediately when you land on owned property
- **Houses only on your turn** - Cannot build between turns
- **Even build rules** - When enabled, must build evenly across color sets
- **Loans and immunity deals allowed** - Players can make any agreement they want
- **Bankruptcy** - If you owe more than you can pay, you're bankrupt

## Troubleshooting

### Server won't start
- Make sure port 3005 is not in use
- Check that you ran `npm install` in the server directory
- Verify Node.js version is 18 or higher

### Client won't connect
- Ensure the server is running first
- Check browser console for errors
- Verify server URL in `client/src/hooks/useSocket.js` (should be http://localhost:3005)

### Game state issues
- Refresh the page
- Make sure all players have stable internet connections
- Check server logs for errors

### Players can't join
- Verify the game code is correct (case-sensitive)
- Make sure the game hasn't started yet
- Check that the game isn't full (max 6 players)

## Future Enhancements (Not Yet Implemented)

These features are planned but not included in this version:

- 3D graphics with Three.js
- Database persistence (PostgreSQL)
- User accounts and authentication
- Game history and replays
- AI opponents
- Mobile app
- Sound effects and animations
- Chat functionality

## Development Notes

### Server Architecture

The server uses a three-layer architecture:

1. **server.js** - Socket.io event handlers and HTTP server
2. **gameRoom.js** - Game room management and player coordination
3. **gameEngine.js** - Pure game logic (no network code)

This separation allows the game engine to be:
- Tested independently
- Reused in other contexts
- Easily understood and modified

### Client Architecture

The client uses React hooks and functional components:

- **useSocket** - Custom hook for Socket.io connection and game methods
- **Component hierarchy** - Clear separation between screens (Home, Lobby, Game)
- **State management** - Local React state with socket updates

### Adding New Features

To add new game mechanics:

1. Add logic to `server/gameEngine.js`
2. Add socket event handlers to `server/server.js`
3. Add client methods to `client/src/hooks/useSocket.js`
4. Update UI components to call new methods

## Credits

This implementation follows official Monopoly rules as documented in `monopoly-complete-rules.md`.

Game design © Hasbro. This is an educational implementation.

## License

This project is for educational purposes only. Monopoly is a registered trademark of Hasbro.

---

## Quick Reference

### Server Endpoints
- Health check: http://localhost:3005/health

### Environment Variables (Optional)

Create `.env` files for custom configuration:

**server/.env:**
```
PORT=3005
NODE_ENV=development
```

**client/.env:**
```
REACT_APP_SERVER_URL=http://localhost:3005
```

### Useful Commands

```bash
# Server
cd server
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)

# Client
cd client
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

---

Enjoy playing Monopoly! 🎲🏠💰
