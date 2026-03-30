/**
 * index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'entrée principal de l'oracle.
 * Charge l'environnement, initialise la blockchain et MQTT,
 * puis orchestre la réception, la validation et l'envoi des données.
 */

require('dotenv').config({ path: `${__dirname}/.env` });

const logger                            = require('./logger');
const { validatePayload }               = require('./validator');
const { initBlockchain, sendDataToContract } = require('./blockchain');
const { initMqtt }                      = require('./mqttClient');

/**
 * Appelée à chaque message MQTT reçu.
 * @param {string} payloadString - Message MQTT brut
 */
async function processMqttMessage(payloadString) {
  logger.data('Payload brut', payloadString);

  // 1. Parsing JSON
  let payload;
  try {
    payload = JSON.parse(payloadString);
  } catch (err) {
    logger.error(`JSON invalide reçu : ${err.message}`);
    logger.separator();
    return;
  }

  // 2. Validation des champs
  const { valid } = validatePayload(payload);
  if (!valid) {
    logger.error("Données ignorées : payload invalide.");
    logger.separator();
    return;
  }

  // 3. Envoi au smart contract (IoTCircuitBreaker prend uniquement temperature)
  await sendDataToContract(payload.temperature);
}

/**
 * Fonction d'amorçage
 */
async function bootstrap() {
  logger.separator();
  logger.info('Démarrage de l\'oracle (MQTT → Blockchain)...');
  logger.separator();

  await initBlockchain();
  initMqtt(processMqttMessage);
}

bootstrap();
