const mongoose = require("mongoose");

const marketplaceProductSchema = new mongoose.Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    variety: String,
    quantity: Number,
    pricePerKg: Number,
    totalPrice: Number,

    image: String,

    // Retailer info (after checkout)
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },

    // 🔗 Blockchain fields
    transactionHash: String,
    blockNumber: Number,
    blockchainStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MarketplaceProduct",
  marketplaceProductSchema
);