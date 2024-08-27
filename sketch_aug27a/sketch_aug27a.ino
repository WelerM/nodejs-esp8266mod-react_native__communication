#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>


const char* ssid = "";       // Replace with your network SSID
const char* password = ""; // Replace with your network password

WebSocketsClient webSocket;

// LED is usually on pin 2 on ESP8266 (D4 on NodeMCU)
#define LED_PIN 2

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket Disconnected");
            break;
        case WStype_CONNECTED:
            Serial.println("WebSocket Connected");
            webSocket.sendTXT("Hello from ESP8266");
            break;
        case WStype_TEXT:
            Serial.printf("Received: %s\n", payload);

            // Check if the received message is "blink"
            if (strcmp((char*)payload, "blink") == 0) {
                Serial.println("Blink command received"); // Debugging line
                // Blink the LED with a 500ms on and 500ms off pattern
                digitalWrite(LED_PIN, LOW);  // LED on
                delay(500);                  // Keep LED on for 500ms
                digitalWrite(LED_PIN, HIGH); // LED off
                delay(500);                  // Keep LED off for 500ms
            } else {
                Serial.println("Unknown command received"); // Debugging line
            }
            break;
        case WStype_BIN:
        case WStype_ERROR:
        case WStype_PING:
        case WStype_PONG:
            break;
    }
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    // Wait for connection
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");

    // Set up the WebSocket client
    webSocket.begin("you_ip_address", 8080, "/"); // Replace with your server's IP
    webSocket.onEvent(webSocketEvent);
    
    // Set up the LED pin
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH); // Turn off LED initially
}

void loop() {
    webSocket.loop();
}









