/**
 * test-mqtt.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates an ESP32 sensor publishing temperature readings to HiveMQ.
 * Use this when your friend's Wokwi simulation is not available.
 *
 * Usage:
 *   node test-mqtt.js              (normal readings + occasional anomalies)
 *   node test-mqtt.js --anomaly    (force anomaly on next reading)
 *   node test-mqtt.js --temp 28    (send a single specific temperature then exit)
 */

require('dotenv').config({ path: `${__dirname}/oracle/.env` });
const mqtt = require('mqtt');

const BROKER_URL = process.env.MQTT_BROKER_URL;
const TOPIC      = process.env.MQTT_TOPIC || 'iot/sensor/temp';
const USERNAME   = process.env.MQTT_USERNAME;
const PASSWORD   = process.env.MQTT_PASSWORD;
const INTERVAL_MS = 3000;

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const forceAnomaly = args.includes('--anomaly');
const tempIndex  = args.indexOf('--temp');
const singleTemp = tempIndex !== -1 ? parseInt(args[tempIndex + 1]) : null;

// ── ANSI colors ───────────────────────────────────────────────────────────────
const C = {
  cyan:   '\x1b[36m', green: '\x1b[32m',
  yellow: '\x1b[33m', red:   '\x1b[31m',
  bold:   '\x1b[1m',  reset: '\x1b[0m',
};
const ts  = () => new Date().toLocaleTimeString('fr-FR', { hour12: false });
const log = (color, tag, msg) => console.log(`${color}[${ts()}] [${tag}]${C.reset} ${msg}`);

// ── Connect ───────────────────────────────────────────────────────────────────
if (!BROKER_URL) {
  console.error('[ERROR] MQTT_BROKER_URL not set in oracle/.env');
  process.exit(1);
}

log(C.cyan, 'INFO', `Connecting to ${BROKER_URL}...`);

const client = mqtt.connect(BROKER_URL, {
  clientId: `esp32-simulator-${Math.random().toString(16).slice(2, 6)}`,
  username: USERNAME,
  password: PASSWORD,
});

client.on('error', (err) => {
  log(C.red, 'ERROR', `MQTT error: ${err.message}`);
});

client.on('connect', () => {
  log(C.green, 'OK', `Connected to broker. Publishing to topic: ${TOPIC}`);
  console.log(`${C.bold}${'─'.repeat(55)}${C.reset}`);

  // ── Single shot mode (--temp X) ───────────────────────────────────────────
  if (singleTemp !== null) {
    publish(singleTemp);
    setTimeout(() => { client.end(); log(C.green, 'OK', 'Done.'); }, 600);
    return;
  }

  // ── Continuous simulation mode ────────────────────────────────────────────
  let count = 0;
  const timer = setInterval(() => {
    count++;
    let temp;
    const isAnomaly = forceAnomaly || Math.random() > 0.8;

    if (isAnomaly) {
      temp = Math.floor(Math.random() * 140) + 60; // 60-200 (out of range)
    } else {
      temp = Math.floor(Math.random() * 15) + 20;  // 20-35 (normal)
    }

    publish(temp, isAnomaly);
  }, INTERVAL_MS);

  process.on('SIGINT', () => {
    clearInterval(timer);
    client.end();
    log(C.yellow, 'INFO', 'Simulator stopped.');
    process.exit(0);
  });
});

function publish(temp, isAnomaly = false) {
  const payload = JSON.stringify({ temperature: temp });
  client.publish(TOPIC, payload, { qos: 1 });

  if (isAnomaly) {
    log(C.red, 'ANOMALY', `Published: ${payload}  (${temp}C - OUT OF RANGE)`);
  } else {
    log(C.green, 'NORMAL ', `Published: ${payload}  (${temp}C)`);
  }
}
