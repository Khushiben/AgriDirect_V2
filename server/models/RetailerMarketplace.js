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

  // ✅ ADD THIS
  blockchainHistory: [
    {
      action: String,
      txHash: String,
      actor: String,
      price: Number,
      timestamp: Date
    }
  ]
},
{
  timestamps: true   // ✅ This will automatically create createdAt and updatedAt
}
);

module.exports = mongoose.model(
  "RetailerMarketplace",
  retailerMarketplaceSchema
);