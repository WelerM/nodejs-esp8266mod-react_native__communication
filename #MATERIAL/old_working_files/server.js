const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
});

const wss = new WebSocket.Server({ server });

let espClient = null;
let clientConnected = false; // Add a flag to track client connection status

wss.on('connection', (ws) => {
    if (!clientConnected) {
        console.log('Client connected');
        clientConnected = true; // Mark the client as connected
    }

    if (!espClient) {
        espClient = ws; // Store the ESP8266 connection
        console.log('ESP8266 connected');
    } else {
        console.log('Browser connected');
    }

    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
            message = message.toString(); // Convert Buffer to string
        }

        console.log(message);

        if (espClient && typeof message === 'string') {
            espClient.send(message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clientConnected = false; // Reset the flag on disconnection
        if (ws === espClient) {
            espClient = null; // Clear ESP8266 connection
        }
    });
});

server.listen(8080, () => {
    console.log('Server is listening on http://localhost:8080');
});
