const { ethers } = require("ethers");
require("dotenv").config();

const abi = require("./AgriDirectABI.json");

let contract = null;

// Only initialize blockchain if all required environment variables are present
if (process.env.SEPOLIA_RPC && process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    
    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    );

    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      abi,
      wallet
    );
    
    console.log("✅ Blockchain contract initialized");
  } catch (error) {
    console.warn("⚠️ Failed to initialize blockchain contract:", error.message);
    console.log("📝 Running without blockchain functionality");
  }
} else {
  console.log("⚠️ Missing blockchain environment variables");
  console.log("📝 Running without blockchain functionality");
}

module.exports = contract;