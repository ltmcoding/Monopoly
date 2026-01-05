# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment & Testing

**GitHub auto-deploy is configured.** When you push to `github.com/ltmcoding/Monopoly`, changes automatically deploy to the production server via webhook.

To test changes:
```bash
git add . && git commit -m "Description of changes" && git push
```

Always push after making changes so they can be tested on the live server.

## Build and Run Commands

### Development (local)
```bash
# Server (Terminal 1)
cd server && npm install && npm start    # http://localhost:3005
cd server && npm run dev                 # with nodemon auto-restart

# Client (Terminal 2)
cd client && npm install && npm start    # http://localhost:3000
```

### Production Build
```bash
cd client && npm run build
```

### Docker (Production)
```bash
docker-compose up -d --build             # standard deployment
docker-compose -f docker-compose.webhook.yml up -d  # with auto-deploy webhook
```

## Architecture

Tycoon - multiplayer property trading game using Socket.io for real-time communication.

### Server (`server/`)

Three-layer architecture:
- **server.js** (~1,200 lines) - Socket.io event handlers, game lifecycle, routes events to GameRoom
- **gameRoom.js** (~350 lines) - Room management, player coordination, chat, session handling
- **gameEngine.js** (~1,160 lines) - Pure game logic (MonopolyGame class), no network code
- **boardData.js** (~615 lines) - Static board data (40 spaces), cards, property definitions

Game state stored in-memory (`const games = new Map()`).

### Client (`client/src/`)

**Hooks:**
- **hooks/useSocket.js** - Socket.io wrapper, all server communication via `emit()`/`on()`

**Components:**
- **App.jsx** - Main app routing and state management
- **Home.jsx** - Create/join game screen
- **Lobby.jsx** - Pre-game lobby, settings, player list
- **Game.jsx** - Main game screen, state sync
- **Board2D.jsx** (~1,360 lines) - 2D board rendering, space positioning
- **PlayerPanel.jsx** - Player info display
- **ActionPanel.jsx** - Action buttons (roll, buy, build, etc.)
- **PropertyCard.jsx** - Property ownership display
- **TradeModal.jsx** - Player-to-player trading interface
- **AuctionModal.jsx** - Auction UI for property bidding
- **RoomBrowser.jsx** - Browse available games
- **GameLog.jsx** - Game event log display
- **components/ui/** - Radix UI-based component library (button, card, dialog, input, label, badge)

**Utils:**
- **utils/boardData.js** - Client-side board data mirror
- **utils/formatters.js** - Currency, player names, time, dice display
- **utils/nameGenerator.js** - Random name generation

**Styles:**
- **styles/App.css** - All CSS styling (dark mode, glassmorphism)
- **Tailwind CSS** - Utility classes via tailwind.config.js

### Adding Features

1. Game logic → `server/gameEngine.js`
2. Socket events → `server/server.js`
3. Room/session logic → `server/gameRoom.js`
4. Client socket methods → `client/src/hooks/useSocket.js`
5. UI components → `client/src/components/`

## Design System

Dark mode glassmorphism design. Uses Tailwind CSS + custom CSS properties.

**Color Palette:**
- Background: `#0f1419` (primary), `#1a1f26` (secondary), `#242b33` (elevated)
- Accent: Amber `#f59e0b` with glow effects
- Text: `#f7fafc` (primary), `#a0aec0` (secondary)

**Key Design Tokens:**
- Glass backgrounds with `backdrop-filter: blur(16px)` and subtle transparency
- Discord-style panel hierarchy (base → secondary → elevated → surface → overlay)
- Amber accent glows: `box-shadow: 0 0 24px rgba(245, 158, 11, 0.2)`
- Border: `rgba(255, 255, 255, 0.08)` subtle white borders

**Typography:**
- Primary: Inter, Noto Sans
- Display: Playfair Display (serif)
- Mono: JetBrains Mono, Fira Code

**Icons:** Phosphor Icons (`@phosphor-icons/react`)

When styling new components, use CSS custom properties from `:root` (e.g., `var(--color-bg-secondary)`, `var(--glass-bg)`, `var(--shadow-glass)`) or Tailwind utilities.

## Game Settings

Configurable in lobby:
- Auction Mode (default: ON)
- No Rent in Jail (default: OFF)
- Mortgage Mode (default: ON)
- Even Build (default: ON)
- Unlimited Properties (default: OFF)
- Starting Cash ($500-$5000, default: $1500)
- Speed Die (default: OFF)
- Double Go Bonus (default: OFF)
- Free Parking (default: OFF)

## Environment Variables

Server: `PORT` (3005), `CLIENT_URL` (CORS), `NODE_ENV`
Client: `REACT_APP_SERVER_URL` (default http://localhost:3005)

## Documentation

Additional docs in `md/`:
- DEPLOYMENT.md - Server deployment with Docker
- GITHUB-SETUP.md - GitHub integration and auto-deploy
- UPDATE-GUIDE.md - How to push updates
- QUICKSTART-PRODUCTION.md - Quick production setup
- CHEAT-SHEET.md - Common commands

Game rules and tech plan in `plans/`.
