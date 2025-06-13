const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Store active games
const games = new Map();

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Create new game
    socket.on('createGame', (playerName) => {
        const roomCode = generateRoomCode();
        games.set(roomCode, {
            players: [{ id: socket.id, name: playerName }],
            currentTurn: 0,
            gameState: null // We'll initialize this when the game starts
        });
        socket.join(roomCode);
        socket.emit('gameCreated', roomCode);
        console.log(`Game created: ${roomCode}`);
    });

    // Join existing game
    socket.on('joinGame', (roomCode, playerName) => {
        const game = games.get(roomCode);
        if (game && game.players.length < 4) {
            game.players.push({ id: socket.id, name: playerName });
            socket.join(roomCode);
            io.to(roomCode).emit('playerJoined', game.players);
            console.log(`Player ${playerName} joined game ${roomCode}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // We'll handle game cleanup later
    });
});

// Start the server
const PORT = process.env.PORT || 3010;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}); 