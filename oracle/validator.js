/**
 * validator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Valide le payload JSON reçu depuis l'ESP32 via MQTT.
 *
 * Format attendu :
 * {
 *   "temperature": 25   ← number, obligatoire
 * }
 */

const logger = require('./logger');

/**
 * @param {Object} payload
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePayload(payload) {
  const errors = [];

  if (payload.temperature === undefined || payload.temperature === null) {
    errors.push("Champ manquant : 'temperature'");
  } else if (typeof payload.temperature !== 'number') {
    errors.push("'temperature' doit être un nombre (number)");
  }

  if (errors.length > 0) {
    errors.forEach((err) => logger.warn(`Validation → ${err}`));
    return { valid: false, errors };
  }

  logger.success('Payload validé ✓');
  return { valid: true, errors: [] };
}

module.exports = { validatePayload };
