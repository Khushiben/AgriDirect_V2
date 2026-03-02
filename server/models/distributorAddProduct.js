const mongoose = require("mongoose");

const distributorPurchaseSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "AddProduct", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // farmer who sold
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // distributor
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
    productImage: { type: String }, // store filename
    status: { type: String, default: "completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Distributortomarketplace", distributorPurchaseSchema);