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

  // Complete supply chain data
  farmerName: String,
  farmerLocation: String,
  farmerSoldPrice: Number,

  distributorName: String,
  distributorSoldPrice: Number,

  blockchainHash: String,

  variety: String,
  quantity: Number,
  price: Number,
  logisticCost: Number,
  totalPrice: Number,
  productImage: String,

  status: {
    type: String,
    default: "available"
  },

  // Complete blockchain transaction history
  blockchainHistory: [
    {
      action: String,
      txHash: String,
      actor: String,
      price: Number,
      timestamp: Date
    }
  ],
  
  // Individual transaction IDs for traceability
  adminApprovalTx: String,
  distributorPurchaseTx: String,
  distributorListingTx: String,
  retailerPurchaseTx: String,
  retailerListingTx: String
},
{
  timestamps: true
}
);

module.exports = mongoose.model(
  "RetailerMarketplace",
  retailerMarketplaceSchema
);