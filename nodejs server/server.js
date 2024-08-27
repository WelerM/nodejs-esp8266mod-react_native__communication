const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Serve the HTML file
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

wss.on('connection', (ws) => {
    console.log('Client connected');

    if (!espClient) {
        espClient = ws; // Store the ESP8266 connection
        console.log('ESP8266 connected');
    } else {
        console.log('Browser connected');
    }

    ws.on('message', (message) => {
        // Check if message is a Buffer
        if (Buffer.isBuffer(message)) {
            message = message.toString(); // Convert Buffer to string
        }
        // If a message is received from the browser, send it to the ESP8266
        if (espClient && typeof message === 'string') {

            console.log('Received from browser:', message);

            console.log('Forwarding to ESP8266:', message);
            espClient.send("blink");

        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws === espClient) {
            espClient = null; // Clear the ESP8266 connection when it disconnects
        }
    });
});

server.listen(8080, () => {
    console.log('Server is listening on http://localhost:8080');
});
