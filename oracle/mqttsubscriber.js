import mqtt from "mqtt";
import { sendTemperature } from "./oracle.js";

// connexion broker public HiveMQ
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("✅ Connecté à HiveMQ");

  client.subscribe("iot/sensor/temp", (err) => {
    if (!err) {
      console.log("📡 Abonné au topic iot/sensor/temp");
    }
  });
});

// réception des données
client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log("📥 Temp reçue :", data.temperature);

    await sendTemperature(data.temperature);

  } catch (err) {
    console.error("Erreur MQTT :", err.message);
  }
});