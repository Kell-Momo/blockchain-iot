# Blockchain-IoT — Oracle Bridge

Connects a simulated ESP32 (Wokwi) to an Ethereum smart contract via MQTT.

```
[ESP32 Wokwi]  →  [HiveMQ Cloud]  →  [Oracle (Node.js)]  →  [Hardhat Blockchain]
 publishes temp      MQTT broker       subscribes & relays      records on-chain
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

---

## Project Structure

```
blockchain-iot/
├── blockchain/               ← Smart contract (Hardhat)
│   ├── contracts/
│   │   └── IoTCircuitBreaker.sol
│   └── scripts/
│       └── deploy.js
├── oracle/                   ← Bridge MQTT → Blockchain
│   ├── index.js              ← Entry point
│   ├── blockchain.js
│   ├── mqttClient.js
│   ├── validator.js
│   ├── logger.js
│   ├── .env                  ← ⚠️ Fill in your credentials
│   └── abi/
│       └── IoTCircuitBreaker.json
├── iot/
│   └── wokwi-code.ino        ← ESP32 simulator (friend's machine)
├── start.ps1                 ← 🚀 Run script
└── package.json
```

---

## Setup (one time)

### 1 — Install dependencies

```bash
cd blockchain-iot
npm install

cd blockchain
npm install
```

### 2 — Fill in `oracle/.env`

```env
MQTT_BROKER_URL=mqtts://527add5052e24f48898418c7dbbab141.s1.eu.hivemq.cloud:8883
MQTT_TOPIC=iot/sensor/temp
MQTT_CLIENT_ID=oracle-node-01
MQTT_USERNAME=your_hivemq_username    ← HiveMQ Cloud dashboard → Manage → Credentials
MQTT_PASSWORD=your_hivemq_password

RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
CONTRACT_ADDRESS=""                   ← auto-filled by the script
```

---

## Running the Project

### First run (deploys the contract automatically)

```powershell
npm run start:full
```

The script will:
1. 🪟 Open a Hardhat node in a separate window
2. ⏳ Wait until the node is ready
3. 🚀 Deploy `IoTCircuitBreaker` and auto-update `CONTRACT_ADDRESS` in `.env`
4. ▶️ Start the oracle — listening for MQTT messages

### Subsequent runs (contract already deployed)

```powershell
npm run start:skip
```

Skips the deployment step and reuses the address already in `.env`.

---

## Then start Wokwi

 open `iot/wokwi-code.ino` on [Wokwi](https://wokwi.com), connects to the same HiveMQ cluster, and starts the simulation. The ESP32 publishes `{"temperature": <value>}` every 3 seconds.

---

## What you'll see when it works

```
[HH:MM:SS] [OK]    Connecté au réseau Hardhat (Chain ID: 31337)
[HH:MM:SS] [OK]    Wallet chargé : 0xf39Fd6...
[HH:MM:SS] [OK]    Contrat IoTCircuitBreaker initialisé à : 0x5FbDB...
[HH:MM:SS] [OK]    Connecté au broker MQTT ✓
[HH:MM:SS] [OK]    Souscrit au topic : iot/sensor/temp
────────────────────────────────────────────────────────────
[HH:MM:SS] [DATA]  Payload brut: {"temperature": 28}
[HH:MM:SS] [OK]    Payload validé ✓
[HH:MM:SS] [INFO]  Envoi au contrat → température : 28°C
[HH:MM:SS] [OK]    Transaction minée dans le bloc 3 ✓
[HH:MM:SS] [INFO]  Anomalies consécutives : 0
────────────────────────────────────────────────────────────
```

After **3 consecutive anomalies** (temp < 0 or > 50°C):
```
[HH:MM:SS] [WARN]  🚨 CAPTEUR RÉVOQUÉ ! (adresse : 0xf39Fd6...)
```

---

## Testing Without the ESP32

Publish manually using [MQTTX](https://mqttx.app/) to the same cluster:

- **Topic:** `iot/sensor/temp`
- **Payload:** `{"temperature": 28}`

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Connection refused` on RPC | Hardhat node not running | Rerun `npm run start:full` |
| `MQTT: Connection refused` | Wrong credentials or URL | Check `oracle/.env` |
| `Sensor is revoked` (tx revert) | 3+ anomalies sent | Restart Hardhat + redeploy |
| `Cannot find module './abi/...'` | Missing ABI file | Check `oracle/abi/IoTCircuitBreaker.json` |
