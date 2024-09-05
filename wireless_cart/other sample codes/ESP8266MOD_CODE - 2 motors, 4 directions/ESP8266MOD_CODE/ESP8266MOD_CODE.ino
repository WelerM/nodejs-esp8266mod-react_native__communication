




#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "Galaxy A05s aa97";     // Replace with your network SSID
const char* password = "mktfivwhd8bga35";  // Replace with your network password

WebSocketsClient webSocket;

// LED is usually on pin 2 on ESP8266 (D4 on NodeMCU)
#define LED_PIN 2    // Onboard LED 
#define D1_PIN 5     // GPIO5 corresponds to D1 on the board
#define D2_PIN 4     // GPIO4 corresponds to D2 on the board

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      webSocket.sendTXT("Hello from ESP8266");
      break;
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);

      if (strcmp((char*)payload, "blink1") == 0) {
        Serial.println("Blink1 command received");
        // Blink LED1
        digitalWrite(D1_PIN, HIGH);  // Turn on the external LED
        digitalWrite(LED_PIN, LOW); // Turn on the onboard LED
        delay(500);                  // Keep LEDs on for 500ms
        digitalWrite(D1_PIN, LOW);   // Turn off the external LED
        digitalWrite(LED_PIN, HIGH);  // Turn off the onboard LED
        delay(500);                  // Keep LEDs off for 500ms
      } 
      else if (strcmp((char*)payload, "blink2") == 0) {
        Serial.println("Blink2 command received");
        // Blink LED2
        digitalWrite(D2_PIN, HIGH);  // Turn on the new LED
        delay(500);                  // Keep LED on for 500ms
        digitalWrite(D2_PIN, LOW);   // Turn off the new LED
        delay(500);                  // Keep LED off for 500ms
      } 
      else {
        Serial.println("Unknown command received");
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
  webSocket.begin("192.168.236.64", 8080, "/");  // Replace with your server's IP
  webSocket.onEvent(webSocketEvent);

  // Set up the LED pins
  pinMode(D1_PIN, OUTPUT);
  pinMode(D2_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  digitalWrite(D1_PIN, LOW);  // Turn off external LED initially
  digitalWrite(D2_PIN, LOW);  // Turn off new LED initially
  digitalWrite(LED_PIN, HIGH);  // Turn off onboard LED initially
}

void loop() {
  webSocket.loop();
}







//Code for 1 led
// #include <ESP8266WiFi.h>
// #include <WebSocketsClient.h>

// const char* ssid = "Galaxy A05s aa97";     // Replace with your network SSID
// const char* password = "mktfivwhd8bga35";  // Replace with your network password

// WebSocketsClient webSocket;

// // LED is usually on pin 2 on ESP8266 (D4 on NodeMCU)
// #define LED_PIN 2    // Onboard LED
// #define D1_PIN 5     // GPIO5 corresponds to D1 on the board

// void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
//   switch (type) {
//     case WStype_DISCONNECTED:
//       Serial.println("WebSocket Disconnected");
//       break;
//     case WStype_CONNECTED:
//       Serial.println("WebSocket Connected");
//       webSocket.sendTXT("Hello from ESP8266");
//       break;
//     case WStype_TEXT:
//       Serial.printf("Received: %s\n", payload);

//       // Check if the received message is "blink"
//       if (strcmp((char*)payload, "blink") == 0) {
//         Serial.println("Blink command received");

//         // Turn on both LEDs
//         digitalWrite(D1_PIN, HIGH);  // Turn on the external LED
//         digitalWrite(LED_PIN, LOW); // Turn on the onboard LED
//         delay(500);                  // Keep LEDs on for 500ms
        
//         // Turn off both LEDs
//         digitalWrite(D1_PIN, LOW);   // Turn off the external LED
//         digitalWrite(LED_PIN, HIGH);  // Turn off the onboard LED
//         delay(500);                  // Keep LEDs off for 500ms

//       } else {
//         Serial.println("Unknown command received");
//       }
//       break;
//     case WStype_BIN:
//     case WStype_ERROR:
//     case WStype_PING:
//     case WStype_PONG:
//       break;
//   }
// }

// void setup() {
//   Serial.begin(115200);
//   WiFi.begin(ssid, password);

//   // Wait for connection
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("");
//   Serial.println("WiFi connected");

//   // Set up the WebSocket client
//   webSocket.begin("192.168.236.64", 8080, "/");  // Replace with your server's IP
//   webSocket.onEvent(webSocketEvent);

//   // Set up the external LED pin (D1)
//   pinMode(D1_PIN, OUTPUT);
//   digitalWrite(D1_PIN, LOW);  // Turn off external LED initially

//   // Set up the onboard LED pin (D4)
//   pinMode(LED_PIN, OUTPUT);
//   digitalWrite(LED_PIN, HIGH);  // Turn off onboard LED initially

// }

// void loop() {
//   webSocket.loop();
// }



