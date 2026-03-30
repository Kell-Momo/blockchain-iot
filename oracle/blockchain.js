/**
 * blockchain.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Connexion au nœud Hardhat et interaction avec IoTCircuitBreaker.sol.
 * Le capteur est identifié par l'adresse du wallet (msg.sender).
 */

const { ethers } = require('ethers');
const logger = require('./logger');
const contractAbi = require('./abi/IoTCircuitBreaker.json');

let provider;
let wallet;
let contract;

/**
 * Initialise la connexion à la blockchain locale.
 */
async function initBlockchain() {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddr = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddr) {
    logger.error("Variables d'environnement manquantes (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS).");
    process.exit(1);
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    logger.success(`Connecté au réseau Hardhat (Chain ID: ${network.chainId})`);

    wallet = new ethers.Wallet(privateKey, provider);
    logger.success(`Wallet chargé : ${wallet.address}`);

    contract = new ethers.Contract(contractAddr, contractAbi, wallet);
    logger.success(`Contrat IoTCircuitBreaker initialisé à : ${contractAddr}`);

  } catch (error) {
    logger.error(`Erreur lors de l'initialisation blockchain : ${error.message}`);
    process.exit(1);
  }
}

/**
 * Appelle sendData(temperature) sur le smart contract.
 * La revocation est détectée via getStatus(wallet.address).
 *
 * @param {number} temperature
 */
async function sendDataToContract(temperature) {
  try {
    logger.info(`Envoi au contrat → température : ${temperature}°C`);

    const tx = await contract.sendData(temperature);
    logger.info(`Transaction envoyée. Hash : ${tx.hash}`);

    const receipt = await tx.wait();
    logger.success(`Transaction minée dans le bloc ${receipt.blockNumber} ✓`);

    // Lecture du statut : 0 = ACTIVE, 1 = REVOKED
    const status = await contract.getStatus(wallet.address);
    if (Number(status) === 1) {
      logger.warn(` CAPTEUR RÉVOQUÉ ! (adresse : ${wallet.address})`);
    } else {
      const sensorData = await contract.sensors(wallet.address);
      logger.info(`Anomalies consécutives : ${sensorData.anomalyCount}`);
    }

    logger.separator();

  } catch (error) {
    logger.error(`Erreur lors de l'enregistrement sur le contrat : ${error.message}`);
    logger.separator();
  }
}

module.exports = { initBlockchain, sendDataToContract };
