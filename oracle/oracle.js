import {ethers} from "ethers"
import {CONTRACT_ADDRESS,PRIVATE_KEY,RPC_URL} from "./config.js"

// console.log("les keys", CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL)

const ABI = [
  "function sendData(uint temperature) public",
  "function getStatus(address) public view returns (uint)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);


export async function sendTemperature(temp) {
    try {
        console.log("Envoi à la blockchain :", temp);
        const tx = await contract.sendData(temp);
        await tx.wait();
        console.log("Transaction confirmée ✅");

        // Ne lire getStatus que si le capteur a déjà envoyé au moins 1 anomalie
        const status = await contract.getStatus(wallet.address);
        if (status === 1) {
            console.log("🚨 CAPTEUR REVOKED !");
        }
    } catch (err) {
        console.error("Erreur :", err.message);
    }
}