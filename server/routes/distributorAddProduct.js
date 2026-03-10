// server/routes/distributorAddProductRoutes.js

const express = require("express");
const router = express.Router();
const FarmerProduct = require("../models/AddProduct");
const AddProduct = require("../models/distributorAddProduct");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// POST - distributor adds product to marketplace
router.post(
  "/add",
  protect,
  upload.single("productImage"),
  async (req, res) => {
    try {
      // 🔹 Safe role check
      if (!req.user || req.user.role?.toLowerCase() !== "distributor") {
        return res.status(403).json({ message: "Only distributors allowed" });
      }

      const {
        productId,
        variety,
        quantity,
        productForm,
        cleaning,
        stoneRemoval,
        millingRequired,
        purchasePrice,
        sellingPrice,
        transportCost,
        loadingCost,
        storageCost,
        processingCost,
        otherCost,
        profit,
        purchaseTxHash,
        adminApprovalTx,
        farmerName,
        farmerLocation,
        adminName
      } = req.body;

      console.log("Received productId:", productId);
      console.log("Received quantity:", quantity);

      // 🔹 Validate required fields
      if (!productId || !quantity) {
        return res.status(400).json({ message: "Product ID and quantity required" });
      }

      const product = await FarmerProduct.findById(productId).populate('farmer', 'name address').populate('assignedAdmin', 'name');
      console.log("Found product:", product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const numericQuantity = Number(quantity);

      if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity value" });
      }

      // Generate listing transaction hash
      const listingTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

      // 🔹 Create distributor listing with complete supply chain data
      const newPurchase = new AddProduct({
        product: productId,
        farmer: product.farmer,
        buyer: req.user._id,
        buyerName: req.user.name,
        variety,
        quantity: numericQuantity,
        productForm,
        cleaning,
        stoneRemoval,
        millingRequired,
        purchasePrice: Math.round(Number(purchasePrice) || 0),
        sellingPrice: Math.round(Number(sellingPrice) || 0),
        transportCost: Math.round(Number(transportCost) || 0),
        loadingCost: Math.round(Number(loadingCost) || 0),
        storageCost: Math.round(Number(storageCost) || 0),
        processingCost: Math.round(Number(processingCost) || 0),
        otherCost: Math.round(Number(otherCost) || 0),
        profit: Math.round(Number(profit) || 0),
        productImage: req.file?.filename || product.image || "",
        status: "available", // ✅ SET STATUS TO AVAILABLE FOR RETAILERS
        listingTxHash: listingTxHash,
        purchaseTxHash: purchaseTxHash || "N/A",
        farmerName: farmerName || product.farmer?.name || "Unknown Farmer",
        farmerLocation: farmerLocation || product.farmer?.address || "Unknown Location",
        farmerPrice: product.price || 0,
        adminApprovalTx: adminApprovalTx || product.blockchainTxHash || "N/A",
        adminName: adminName || product.assignedAdmin?.name || "Unknown Admin"
      });

      await newPurchase.save();

      res.status(201).json({
        message: "Distributor product added",
        purchase: newPurchase,
        txHash: listingTxHash
      });

    } catch (err) {
      console.error("❌ Error adding distributor product:");
      console.error(err.message);
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

module.exports = router;