const mongoose = require("mongoose");

const retailerPurchaseSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributortomarketplace",
      required: true
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    distributorName: String,
    retailerName: String,

    variety: String,

    quantity: {
      type: Number,
      required: true
    },

    pricePerKg: Number,

    totalPrice: Number,

    // ✅ ADDED THIS
    productImage: String,

    status: {
      type: String,
      default: "PURCHASED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RetailerPurchase", retailerPurchaseSchema);