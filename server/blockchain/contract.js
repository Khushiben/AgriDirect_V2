const { ethers } = require("ethers");
require("dotenv").config();

const abi = require("./AgriDirectABI.json");

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC);

const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

module.exports = contract;