#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("WiFi connecté");
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.println("Connexion MQTT...");
    client.connect("ESP32Client");
    delay(500);
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) { connectMQTT(); }
  client.loop();

  int temp;
  if (random(0, 10) > 7) { temp = random(150, 200); } // anomalie
  else { temp = random(20, 35); } // normal

  String payload = "{\"temperature\": " + String(temp) + "}";
  Serial.println(payload);

  client.publish("iot/sensor/temp", payload.c_str());
  delay(3000);
}