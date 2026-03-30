/**
 * mqttClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gère la connexion au broker MQTT (HiveMQ) et la souscription au topic.
 */

const mqtt = require('mqtt');
const logger = require('./logger');

/**
 * Initialise le client MQTT et écoute les messages.
 *
 * @param {Function} onMessageCallback - Appelée à chaque message reçu (string payload)
 */
function initMqtt(onMessageCallback) {
  const brokerUrl = process.env.MQTT_BROKER_URL;
  const topic = process.env.MQTT_TOPIC;
  const clientId = process.env.MQTT_CLIENT_ID || `oracle-node-${Math.random().toString(16).slice(2, 8)}`;

  if (!brokerUrl || !topic) {
    logger.error('Configuration MQTT manquante dans .env (MQTT_BROKER_URL ou MQTT_TOPIC).');
    process.exit(1);
  }

  logger.info(`Connexion au broker MQTT : ${brokerUrl} (Client: ${clientId})`);

  const connectOptions = { clientId };
  if (process.env.MQTT_USERNAME) connectOptions.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) connectOptions.password = process.env.MQTT_PASSWORD;

  const client = mqtt.connect(brokerUrl, connectOptions);

  client.on('connect', () => {
    logger.success('Connecté au broker MQTT avec succès ✓');

    // Souscription avec QoS 1 (at-least-once delivery)
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (!err) {
        logger.success(`Souscrit au topic : ${topic}`);
        logger.separator();
      } else {
        logger.error(`Erreur de souscription au topic : ${err.message}`);
      }
    });
  });

  // Écoute des messages, délègue au callback
  client.on('message', (receivedTopic, message) => {
    logger.info(`Message reçu sur le topic : ${receivedTopic}`);
    onMessageCallback(message.toString());
  });

  client.on('error', (error) => {
    logger.error(`Erreur MQTT (${brokerUrl}) : ${error.message}`);
  });

  client.on('offline', () => {
    logger.warn('Client MQTT hors ligne. Tentative de reconnexion...');
  });
}

module.exports = { initMqtt };
