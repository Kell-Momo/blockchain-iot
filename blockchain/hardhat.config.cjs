// // import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
// import "@nomicfoundation/hardhat-ethers"; // ✅ AJOUT IMPORTANT
// import { configVariable, defineConfig } from "hardhat/config";

// export default defineConfig({
//   // plugins: [hardhatToolboxMochaEthersPlugin],
//   solidity: {
//     profiles: {
//       default: {
//         version: "0.8.28",
//       },
//       production: {
//         version: "0.8.28",
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 200,
//           },
//         },
//       },
//     },
//   },
//   networks: {
//     hardhatMainnet: {
//       type: "edr-simulated",
//       chainType: "l1",
//     },
//     hardhatOp: {
//       type: "edr-simulated",
//       chainType: "op",
//     },
//     sepolia: {
//       type: "http",
//       chainType: "l1",
//       url: configVariable("SEPOLIA_RPC_URL"),
//       accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
//     },
//   },
// });

// import "@nomicfoundation/hardhat-toolbox";
// import { defineConfig } from "hardhat/config";

// export default defineConfig({
//   solidity: "0.8.28",
// });

require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
};