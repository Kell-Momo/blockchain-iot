#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid        = "Wokwi-GUEST";
const char* password    = "";
const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic  = "iot/sensor/temp";

WiFiClient   espClient;
PubSubClient client(espClient);

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connecté");
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.println("Connexion MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT connecté ✓");
    } else {
      delay(500);
    }
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  int temp;

  // 🔥 Simulation d'anomalies (~20% de chance)
  if (random(0, 10) > 7) {
    temp = random(60, 200); // anomalie (hors plage 0–50°C)
  } else {
    temp = random(20, 35);  // normal
  }

  String payload = "{\"temperature\": " + String(temp) + "}";

  Serial.println(payload);
  client.publish(mqtt_topic, payload.c_str());

  delay(3000);
}