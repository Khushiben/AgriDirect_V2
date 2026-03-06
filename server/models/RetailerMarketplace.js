const mongoose = require("mongoose");

const retailerMarketplaceSchema = new mongoose.Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    retailerName: String,

    originalPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RetailerPurchase"
    },

    variety: String,
    quantity: Number,
    price: Number,           // selling price per kg

    logisticCost: Number,    // ✅ ADDED

    totalPrice: Number,      // ✅ ADDED (price + logisticCost)

    productImage: String,

    status: {
      type: String,
      default: "available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RetailerMarketplace",
  retailerMarketplaceSchema
);