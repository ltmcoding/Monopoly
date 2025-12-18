# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment & Testing

**GitHub auto-deploy is configured.** When you push to `github.com/ltmcoding/Monopoly`, changes automatically deploy to the production server.

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

# Client (Terminal 2)
cd client && npm install && npm start    # http://localhost:3000
```

### Production Build
```bash
cd client && npm run build
```

## Architecture

Multiplayer Monopoly using Socket.io for real-time communication.

### Server (`server/`)

Three-layer architecture:
- **server.js** - Socket.io event handlers, game lifecycle, routes events to GameRoom
- **gameRoom.js** - Room management, player coordination, state sync
- **gameEngine.js** - Pure game logic (MonopolyGame class), no network code
- **boardData.js** - Static board data, cards, property definitions

Game state stored in-memory (`const games = new Map()`).

### Client (`client/src/`)

- **hooks/useSocket.js** - Socket.io wrapper, all server communication via `emit()`/`on()`
- **components/** - React components: Home, Lobby, Game, Board2D, PlayerPanel, ActionPanel, TradeModal, AuctionModal
- **utils/boardData.js** - Client-side board data
- **styles/App.css** - All CSS styling

### Adding Features

1. Game logic → `server/gameEngine.js`
2. Socket events → `server/server.js`
3. Client methods → `client/src/hooks/useSocket.js`
4. UI → components

## Design System

Dark mode glassmorphism design defined in `client/src/styles/App.css`:

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
- Primary: Inter, system fonts
- Display: Playfair Display (serif)

**Spacing:** 4px base scale (--space-1 through --space-16)
**Border radius:** 4px to 24px scale

When styling new components, use CSS custom properties from `:root` (e.g., `var(--color-bg-secondary)`, `var(--glass-bg)`, `var(--shadow-glass)`).

## Environment Variables

Server: `PORT` (3005), `CLIENT_URL` (CORS)
Client: `REACT_APP_SERVER_URL` (default http://localhost:3005)
