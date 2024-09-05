// Definindo as portas GPIO para os pinos do L298N
int IN1 = 5;  // GPIO5 (D1) - Motor 1
int IN2 = 4;  // GPIO4 (D2) - Motor 1
int IN3 = 0;  // GPIO0 (D3) - Motor 2
int IN4 = 2;  // GPIO2 (D4) - Motor 2

void setup() {
  // Configurando as portas como saídas
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
}

void loop() {
  // Controlando Motor 1 para frente
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  // Controlando Motor 2 para frente
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  delay(2000);  // Executa por 2 segundos

  //Para ambos motores por 100ms
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  delay(100);


  // Controlando Motor 1 para trás
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  // Controlando Motor 2 para trás
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  delay(2000);  // Executa por 2 segundos

  // Parando ambos os motores
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  delay(2000);  // Pausa por 2 segundos
}
