const mongoose = require("mongoose");

const distributorPurchaseSchema = new mongoose.Schema(
  {
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "AddProduct", 
      required: true 
    },
    farmer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    buyer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    buyerName: { type: String },
    variety: { type: String },
    quantity: { type: Number, required: true },
    productForm: { type: String },
    cleaning: { type: String },
    stoneRemoval: { type: String },
    millingRequired: { type: String },
    purchasePrice: { type: Number },
    sellingPrice: { type: Number },
    transportCost: { type: Number },
    loadingCost: { type: Number },
    storageCost: { type: Number },
    processingCost: { type: Number },
    otherCost: { type: Number },
    profit: { type: Number },
    productImage: { type: String },
    status: { type: String, default: "IN_PROGRESS" },

    // Transaction tracking
    listingTxHash: String,
    purchaseTxHash: String,
    
    // Supply chain data for traceability
    farmerName: String,
    farmerLocation: String,
    farmerPrice: Number,
    adminApprovalTx: String,
    adminName: String,
    
    // Complete blockchain history
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
  { timestamps: true }
);

module.exports = mongoose.model("Distributortomarketplace", distributorPurchaseSchema);