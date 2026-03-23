import hre from "hardhat";

async function main() {
  console.log("Deploying contract...");

  const Contract = await hre.ethers.getContractFactory("IoTCircuitBreaker");

  console.log("Factory loaded");

  const contract = await Contract.deploy();

  console.log("Deployment tx sent...");

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ Contract deployed to:", address);
}

main()
  .then(() => {
    console.log("🎉 Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });