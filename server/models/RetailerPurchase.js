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

    productImage: String,

    status: {
      type: String,
      default: "PURCHASED"
    },
    
    // Transaction tracking
    purchaseTxHash: String,
    
    // Complete supply chain data for traceability
    farmerName: String,
    farmerLocation: String,
    farmerPrice: Number,
    adminApprovalTx: String,
    adminName: String,
    distributorPurchaseTx: String,
    distributorListingTx: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("RetailerPurchase", retailerPurchaseSchema);