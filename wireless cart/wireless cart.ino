#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "Galaxy A05s aa97";     // Replace with your network SSID
const char* password = "mktfivwhd8bga35";  // Replace with your network password

WebSocketsClient webSocket;

// Definindo as portas GPIO para os pinos do L298N
int MOTOR1_IN1 = 5;  // GPIO5 (D1) - Motor 1
int MOTOR1_IN2 = 4;  // GPIO4 (D2) - Motor 1
int MOTOR2_IN3 = 0;  // GPIO0 (D3) - Motor 2
int MOTOR2_IN4 = 2;  // GPIO2 (D4) - Motor 2

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

      if (strcmp((char*)payload, "foward") == 0) {

        Serial.println("foward command received");


        //Turns off both motors for safety before starting again
              //Motor 1
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN1, LOW);
        //Motor 2
        digitalWrite(MOTOR2_IN3, LOW);  
        digitalWrite(MOTOR2_IN4, LOW);  
        delay(100);
        //===================================



        //Motor 1
        digitalWrite(MOTOR1_IN1, HIGH);  
        digitalWrite(MOTOR1_IN2, LOW);   

        //Motor 2
        digitalWrite(MOTOR2_IN3, HIGH);  
        digitalWrite(MOTOR2_IN4, LOW);  

      } else if (strcmp((char*)payload, "backward") == 0) {

        Serial.println("backward command received");


        //Turns off both motors for safety before starting again
        //Motor 1
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN1, LOW);
        //Motor 2
        digitalWrite(MOTOR2_IN3, LOW);  
        digitalWrite(MOTOR2_IN4, LOW); 
        delay(100);
        //===================================


        //Motor 1
        digitalWrite(MOTOR1_IN1, LOW);   
        digitalWrite(MOTOR1_IN2, HIGH);  

        //Motor 2
        digitalWrite(MOTOR2_IN3, LOW);   
        digitalWrite(MOTOR2_IN4, HIGH);  

      } else if (strcmp((char*)payload, "left") == 0) {

        Serial.println("left command received");


        //Turns off both motors for safety before starting again
        //Motor 1
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN1, LOW);
        //Motor 2
        digitalWrite(MOTOR2_IN3, LOW);  
        digitalWrite(MOTOR2_IN4, LOW);  
        delay(100);
        //===================================


        //Stops motor 2
        digitalWrite(MOTOR2_IN3, LOW);  
        digitalWrite(MOTOR2_IN4, LOW);  

        //Starts motor 1
        digitalWrite(MOTOR1_IN1, HIGH);  
        digitalWrite(MOTOR1_IN2, LOW);   


      } else if (strcmp((char*)payload, "right") == 0) {

        Serial.println("right command received");

        //Turns off both motors for safety before starting again
        //Motor 1
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN1, LOW);
        //Motor 2
        digitalWrite(MOTOR2_IN3, LOW);  
        digitalWrite(MOTOR2_IN4, LOW);  
        delay(100);
        //===================================


        //Stops motor 1
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN2, LOW);

        //Starts motor 2
        digitalWrite(MOTOR2_IN3, HIGH);
        digitalWrite(MOTOR2_IN4, LOW);


      } else if (strcmp((char*)payload, "stop") == 0) {

        //Stops motor 1 and 2 (talvez de para criar resistencia)
        digitalWrite(MOTOR1_IN1, LOW);
        digitalWrite(MOTOR1_IN2, LOW);
        digitalWrite(MOTOR2_IN3, LOW);
        digitalWrite(MOTOR2_IN4, LOW);


      } else {
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

  // Configurando as portas como saídas
  pinMode(MOTOR1_IN1, OUTPUT);
  pinMode(MOTOR1_IN2, OUTPUT);
  pinMode(MOTOR2_IN3, OUTPUT);
  pinMode(MOTOR2_IN4, OUTPUT);

  digitalWrite(MOTOR1_IN1, LOW);
  digitalWrite(MOTOR1_IN2, LOW);
  digitalWrite(MOTOR2_IN3, LOW);
  digitalWrite(MOTOR2_IN4, LOW);
}

void loop() {
  webSocket.loop();
}
