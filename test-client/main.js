const WebSocket = require('ws');

const socket = new WebSocket('ws://127.0.0.1:3000/ws');

socket.on('open', () => {
    console.log('Connected to server');
    socket.send("Ping test");
});

socket.on('message', (data) => {
    console.log('Received: ' + data);
});

socket.on('error', (err) => {
    console.error('Error:', err.message);
});

socket.on('close', () => {
    console.log('Disconnected');
});