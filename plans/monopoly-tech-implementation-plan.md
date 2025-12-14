# 3D Multiplayer Monopoly - Technical Implementation Plan

## Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express
- **Real-time Communication:** Socket.io
- **In-Memory Store:** Redis
- **Database (Optional):** PostgreSQL
- **Process Manager:** PM2

### Frontend
- **UI Framework:** React
- **3D Engine:** Three.js
- **3D React Integration:** React Three Fiber (@react-three/fiber)
- **3D Utilities:** @react-three/drei
- **Animation:** @react-spring/three
- **WebSocket Client:** socket.io-client

### DevOps
- **Web Server:** Nginx (reverse proxy, static files, SSL termination)
- **SSL:** Let's Encrypt (via Certbot)
- **Hosting:** Your own server

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              Your Server                         │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Nginx (Port 80/443)                     │   │
│  │  - Serves React static files             │   │
│  │  - Reverse proxy to Node.js              │   │
│  │  - WebSocket proxy                       │   │
│  │  - SSL termination                       │   │
│  └──────────────┬───────────────────────────┘   │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐   │
│  │  Node.js Server (Port 3005)              │   │
│  │  - Express HTTP server                   │   │
│  │  - Socket.io WebSocket server            │   │
│  │  - Game room management                  │   │
│  │  - Action validation                     │   │
│  └──────────────┬───────────────────────────┘   │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐   │
│  │  Game Engine (Pure Logic)                │   │
│  │  - State management                      │   │
│  │  - Game rules implementation             │   │
│  │  - Turn/phase management                 │   │
│  │  - Configurable rule settings            │   │
│  └──────────────┬───────────────────────────┘   │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐   │
│  │  Redis                                   │   │
│  │  - Active game states                    │   │
│  │  - Player sessions                       │   │
│  │  - Lobby data                            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                   ▲
                   │ HTTPS + WebSocket
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│Browser │    │Browser │    │Browser │
│  1     │    │  2     │    │  N     │
│        │    │        │    │        │
│ React  │    │ React  │    │ React  │
│Three.js│    │Three.js│    │Three.js│
└────────┘    └────────┘    └────────┘
```

---

## Implementation Phases

## Phase 1: Core Game Engine (Week 1-2)

### Objective
Build pure game logic without UI or networking.

### Tasks

#### 1.1 Data Structures
Define core game state structure:
- Players array (id, name, cash, position, properties, jailStatus)
- Properties object (ownership, buildings, mortgageStatus)
- Game metadata (currentPlayerIndex, phase, diceResults, settings)
- Action queue for sequential processing

#### 1.2 Game Engine Module
Implement `gameEngine.js`:
- Constructor accepting game settings object
- State initialization
- Core methods:
  - `rollDice()` - returns dice values, handles doubles, Speed Die
  - `movePlayer(playerId, spaces)` - updates position, handles passing GO
  - `buyProperty(playerId, propertyId)` - validates and executes purchase
  - `collectRent(fromId, toId, amount)` - handles rent payment
  - `buildHouse(playerId, propertyId)` - validates and builds
  - `buildHotel(playerId, propertyId)` - validates and builds
  - `mortgage(playerId, propertyId)` - mortgages property
  - `unmortgage(playerId, propertyId)` - unmortgages property
  - `trade(player1Id, player2Id, tradeDetails)` - executes trade
  - `declareProperty(playerId)` - declines purchase, triggers auction
  - `auctionBid(playerId, amount)` - processes auction bid
  - `endTurn(playerId)` - advances to next player
  - `getGameState()` - returns serializable state
  - `validateAction(playerId, action)` - checks if action is legal

#### 1.3 Rules Engine
Implement configurable rule settings:
- `auctionMode`: boolean (default: true)
- `noRentInJail`: boolean (default: false)
- `mortgageMode`: boolean (default: true)
- `evenBuild`: boolean (default: true)
- `unlimitedProperties`: boolean (default: false)
- `startingCash`: number (default: 1500)
- `speedDie`: boolean (default: false)

Each setting affects specific game logic branches.

#### 1.4 Testing
Write unit tests for:
- Each game action
- Edge cases (bankruptcy, building limits, mortgages)
- All rule setting combinations
- State consistency after actions

**Deliverable:** Tested game engine that can be run via Node.js console.

---

## Phase 2: Server & Networking (Week 2-3)

### Objective
Create multiplayer server with WebSocket communication.

### Tasks

#### 2.1 Server Setup
Initialize Node.js project:
```bash
npm init
npm install express socket.io redis cors dotenv
```

Create `server.js`:
- Initialize Express app
- Create HTTP server
- Attach Socket.io to HTTP server
- Configure CORS for your domain
- Connect to Redis

#### 2.2 Game Room Management
Create `gameRoom.js` class:
- Properties:
  - `gameId`: unique identifier
  - `game`: instance of MonopolyGame
  - `players`: array of player sockets
  - `isStarted`: boolean
  - `settings`: game configuration
- Methods:
  - `addPlayer(socket, playerName)`
  - `removePlayer(socketId)`
  - `startGame()`
  - `processAction(playerId, action, data)`
  - `broadcast(event, data)`
  - `getGameState()`

#### 2.3 WebSocket Event Handlers
Implement Socket.io events in `server.js`:

**Incoming (Client → Server):**
- `createGame` → create new game room
- `joinGame` → add player to room
- `startGame` → begin game
- `rollDice` → process dice roll
- `buyProperty` → purchase property
- `buildHouse` → build house
- `buildHotel` → build hotel
- `mortgage` → mortgage property
- `unmortgage` → unmortgage property
- `trade` → propose/accept trade
- `auctionBid` → place auction bid
- `endTurn` → end current turn
- `disconnect` → handle player leaving

**Outgoing (Server → Client):**
- `gameCreated` → send game ID and initial state
- `playerJoined` → notify all players
- `playerLeft` → notify all players
- `gameStarted` → game begins
- `gameUpdate` → broadcast state changes
- `error` → send error messages

#### 2.4 Redis Integration
Store game states in Redis:
- Key: `game:{gameId}`
- Value: JSON serialized game state
- TTL: 24 hours for inactive games
- Methods:
  - `saveGameState(gameId, state)`
  - `loadGameState(gameId)`
  - `deleteGame(gameId)`

#### 2.5 Action Validation
Implement server-side validation:
- Verify it's player's turn
- Check sufficient funds
- Verify property ownership
- Validate building availability
- Check for mortgaged properties
- Reject invalid actions with error messages

#### 2.6 Connection Management
Handle disconnections:
- Store socket-to-player mapping
- On disconnect: pause game for 2 minutes
- Allow reconnection within timeout
- If timeout expires: forfeit player or AI takeover
- Handle host leaving: transfer to another player

**Deliverable:** Working multiplayer server that can host games and process actions.

---

## Phase 3: Basic Frontend (Week 3-4)

### Objective
Create React frontend with 2D UI, connected to server.

### Tasks

#### 3.1 React Setup
```bash
npx create-react-app client
cd client
npm install socket.io-client
```

Project structure:
```
client/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Home.jsx
│   │   ├── Lobby.jsx
│   │   ├── GameBoard.jsx
│   │   ├── PlayerPanel.jsx
│   │   ├── ActionPanel.jsx
│   │   └── PropertyCard.jsx
│   ├── hooks/
│   │   └── useSocket.js
│   └── utils/
│       └── gameUtils.js
```

#### 3.2 Socket Connection Hook
Create `useSocket.js`:
- Establish Socket.io connection on mount
- Handle reconnection logic
- Expose methods to emit events
- Set up listeners for server events
- Update React state on events

#### 3.3 Screen Components

**Home.jsx:**
- "Create Game" button → emit `createGame`
- "Join Game" input + button → emit `joinGame`

**Lobby.jsx:**
- Display game code
- List joined players
- Settings configuration panel
- "Start Game" button (host only) → emit `startGame`

**GameBoard.jsx:**
- 2D board representation (simple grid or circle)
- Display 40 spaces with names
- Show player tokens on spaces
- Clickable spaces for property info

**PlayerPanel.jsx:**
- List all players with colors
- Highlight current player
- Show cash, property count for each

**ActionPanel.jsx:**
- Context-sensitive buttons based on game phase:
  - "Roll Dice" → emit `rollDice`
  - "Buy Property" → emit `buyProperty`
  - "Decline" → emit `declareProperty`
  - "Build House" → emit `buildHouse`
  - "Mortgage" → emit `mortgage`
  - "End Turn" → emit `endTurn`

**PropertyCard.jsx:**
- Modal showing property details
- Owner, price, rent, buildings
- Action buttons if applicable

#### 3.4 State Management
Use React Context or local state:
- Store game state from server
- Update on `gameUpdate` events
- Derive UI state (which buttons to show)

#### 3.5 Event Flow
Example: Rolling dice
1. User clicks "Roll Dice" button
2. Client emits `rollDice` event
3. Server processes, updates state
4. Server broadcasts `gameUpdate` with new state
5. Client receives update, re-renders UI

**Deliverable:** Functional game with basic 2D UI. Can play complete games.

---

## Phase 4: 3D Graphics (Week 4-6)

### Objective
Replace 2D board with 3D scene using Three.js.

### Tasks

#### 4.1 Three.js Setup
```bash
npm install three @react-three/fiber @react-three/drei @react-spring/three
```

#### 4.2 Canvas Setup
Create `Game3D.jsx`:
- Wrap scene in `<Canvas>` from React Three Fiber
- Set up camera position (angled top-down view)
- Add lighting (ambient + directional)
- Enable shadows

#### 4.3 Board Component
Create `Board3D.jsx`:
- Define 3D positions for 40 spaces
  - Bottom edge: X from 5 to -5, Z = 5
  - Left edge: X = -5, Z from 5 to -5
  - Top edge: X from -5 to 5, Z = -5
  - Right edge: X = 5, Z from -5 to 5
- Render colored boxes for each space
- Add 3D text labels above spaces
- Central board surface (green plane)

#### 4.4 Player Tokens
Create `PlayerToken.jsx`:
- Simple 3D geometry (cylinder + sphere)
- Unique color per player
- Animate position changes with `useSpring`
- Smooth interpolation when moving
- Glow effect for current player

#### 4.5 Dice Animation
Create `Dice3D.jsx`:
- Two cube geometries (or three for Speed Die)
- Physics-based rolling animation:
  - Initial upward velocity
  - Random rotation
  - Gravity simulation
  - Damping to slow down
  - Final orientation shows correct value
- Map dice values to specific rotations
- Duration: 2-3 seconds

#### 4.6 Buildings
Create `Building3D.jsx`:
- House: small cube + pyramid roof
- Hotel: larger, distinct model
- Position on property spaces
- Pop-in animation when built

#### 4.7 Camera Controls
Add camera features:
- Orbit controls (user can rotate/pan/zoom)
- Smooth transitions to follow current player
- Preset camera positions (overview, player focus)
- Use `useSpring` for smooth camera movement

#### 4.8 UI Overlay
Keep 2D UI elements as HTML overlays:
- Absolute positioning on top of Canvas
- Action buttons, player info, game log
- Use `pointer-events: none` on wrapper
- Enable `pointer-events: auto` on interactive elements

#### 4.9 Integration
Replace `GameBoard.jsx` with `Game3D.jsx`:
- Pass game state as props
- Map state to 3D component positions
- Handle click events on 3D objects
- Maintain all functionality from 2D version

**Deliverable:** Fully functional 3D game with animations.

---

## Phase 5: Deployment (Week 6-7)

### Objective
Deploy to your server with proper configuration.

### Tasks

#### 5.1 Server Preparation
Install required software:
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Redis
sudo apt-get install redis-server

# Nginx
sudo apt-get install nginx

# PM2
sudo npm install -g pm2

# Certbot
sudo apt-get install certbot python3-certbot-nginx
```

#### 5.2 Application Deployment

Build React app:
```bash
cd client
npm run build
```

Directory structure on server:
```
/var/www/monopoly/
├── client/          # React build files
├── server/          # Node.js application
└── logs/
```

#### 5.3 Environment Configuration
Create `.env` file:
```
NODE_ENV=production
PORT=3005
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=https://yourdomain.com
```

#### 5.4 Nginx Configuration
Configure reverse proxy:
- Serve React static files from `/client` directory
- Proxy `/api` to Node.js (port 3005)
- Proxy `/socket.io` to Node.js with WebSocket upgrade headers
- Force HTTPS redirect
- Enable gzip compression

Example config structure:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    location / {
        root /var/www/monopoly/client;
        try_files $uri /index.html;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 5.5 SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```
Auto-renewal enabled by default.

#### 5.6 PM2 Process Management
Start Node.js server:
```bash
cd /var/www/monopoly/server
pm2 start server.js --name monopoly-game
pm2 save
pm2 startup
```

Configuration:
- Enable cluster mode (multiple instances)
- Auto-restart on crash
- Log rotation

#### 5.7 Redis Configuration
Edit `/etc/redis/redis.conf`:
- Set password: `requirepass yourpassword`
- Bind to localhost: `bind 127.0.0.1`
- Enable persistence: `save 900 1`
- Restart Redis: `sudo systemctl restart redis`

#### 5.8 Firewall Setup
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### 5.9 Monitoring
Set up basic monitoring:
- PM2 monitoring: `pm2 monit`
- View logs: `pm2 logs`
- Check status: `pm2 status`

#### 5.10 Backup Strategy
Create backup script:
- Daily Redis snapshots
- Store in separate location
- Rotate old backups

**Deliverable:** Game running on your server, accessible via HTTPS.

---

## Data Flow

### Game State Synchronization

```
Client Action → Socket.io Event → Server Validation
                                          ↓
                                   Game Engine
                                          ↓
                                   Update State
                                          ↓
                                   Save to Redis
                                          ↓
                    Broadcast to All Clients
                                          ↓
               Clients Update React State
                                          ↓
                    Three.js Re-renders Scene
```

### Key Principles
1. **Server is authoritative** - all game logic runs on server
2. **Clients are presentation layer** - render what server tells them
3. **No client-side game logic** - prevents cheating
4. **Optimistic updates allowed** - for better UX, but reconcile with server

---

## Security Considerations

### Server-Side
- Validate all incoming actions
- Rate limit Socket.io events
- Sanitize user inputs
- Use HTTPS only
- Redis password protected
- Firewall configured

### Client-Side
- No sensitive logic in client code
- All calculations verified by server
- Display errors gracefully
- Handle malformed server responses

---

## Performance Optimization

### Backend
- Redis for fast in-memory access
- Action queue prevents race conditions
- Connection pooling if using PostgreSQL
- Cluster mode with PM2

### Frontend
- Lazy load 3D models
- Use instancing for repeated geometries
- Frustum culling (Three.js default)
- Limit particles and effects
- Throttle state updates

### Network
- Binary WebSocket protocol (optional: msgpack)
- Compress large messages
- Only send state diffs (optional optimization)
- Gzip compression in Nginx

---

## Testing Strategy

### Unit Tests
- Game engine: all rules and actions
- Use Jest or Mocha
- Mock dependencies

### Integration Tests
- Server: Socket.io event handling
- Test full action workflows
- Mock Redis

### End-to-End Tests
- Use Puppeteer or Cypress
- Simulate multiple players
- Test full game from start to finish

### Load Testing
- Use Artillery.io or k6
- Test concurrent games
- Identify bottlenecks

---

## Development Workflow

### Version Control
```bash
git init
git remote add origin <your-repo>

# Branch strategy
main          # production
develop       # development
feature/*     # features
hotfix/*      # urgent fixes
```

### Development Process
1. Write failing test
2. Implement feature
3. Pass test
4. Commit
5. Push to feature branch
6. Merge to develop
7. Test on staging
8. Merge to main
9. Deploy to production

### Deployment Process
```bash
# On local machine
git push origin main

# On server
cd /var/www/monopoly
git pull origin main
cd client && npm run build
cd ../server && npm install
pm2 restart monopoly-game
```

---

## Maintenance

### Regular Tasks
- Monitor server resources (CPU, RAM, disk)
- Check PM2 logs for errors
- Verify Redis is running
- Check SSL certificate expiry
- Update dependencies monthly
- Review backups

### Scaling Checklist
When you need to scale:
1. Profile to find bottlenecks
2. Optimize hot code paths
3. Add Redis caching
4. Enable PM2 cluster mode
5. Consider multiple servers + load balancer
6. Use Socket.io Redis adapter for cross-server communication

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | 1-2 weeks | Game engine with tests |
| Phase 2 | 1-2 weeks | Multiplayer server |
| Phase 3 | 1-2 weeks | 2D functional UI |
| Phase 4 | 2-3 weeks | 3D graphics |
| Phase 5 | 1 week | Deployed to server |
| **Total** | **6-10 weeks** | **Production-ready game** |

---

## Final Architecture Summary

```
┌────────────────────────────────────────┐
│         Your Domain (HTTPS)            │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│  Nginx (Ports 80/443)                  │
│  - Static files: React build           │
│  - Reverse proxy: /socket.io → :3005   │
│  - SSL termination                     │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│  Node.js + Socket.io (Port 3005)       │
│  - Managed by PM2 (cluster mode)       │
│  - Game rooms + event handlers         │
│  - Action validation                   │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│  Game Engine (gameEngine.js)           │
│  - Pure logic                          │
│  - All rules implemented               │
│  - State management                    │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│  Redis (localhost:6379)                │
│  - Active game states                  │
│  - Session data                        │
│  - TTL: 24h for inactive games         │
└────────────────────────────────────────┘
```

---

## Next Steps

1. **Clone/create project structure**
2. **Phase 1:** Build game engine, write tests
3. **Phase 2:** Implement server, test with multiple clients
4. **Phase 3:** Build React UI, connect to server
5. **Phase 4:** Add Three.js 3D graphics
6. **Phase 5:** Deploy to your server

---

## Notes

- All game logic runs on server (prevents cheating)
- Redis stores active games in memory (fast access)
- Three.js renders 3D board and animations
- Socket.io handles real-time bidirectional communication
- PM2 ensures server stays running
- Nginx handles SSL, static files, and reverse proxy
- Your custom rules are implemented as configurable settings in the game engine

This plan provides a clear path from nothing to a deployed, working 3D multiplayer Monopoly game on your own server.
