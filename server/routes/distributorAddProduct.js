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
      } = req.body;

      console.log("Received productId:", productId);
      console.log("Received quantity:", quantity);

      // 🔹 Validate required fields
      if (!productId || !quantity) {
        return res.status(400).json({ message: "Product ID and quantity required" });
      }

      const product = await FarmerProduct.findById(productId);
      console.log("Found product:", product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const numericQuantity = Number(quantity);

      if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity value" });
      }

      // 🔹 NO farmer stock check here
      // 🔹 NO farmer stock reduction here

      // 🔹 Create distributor listing
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
        purchasePrice: Number(purchasePrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        transportCost: Number(transportCost) || 0,
        loadingCost: Number(loadingCost) || 0,
        storageCost: Number(storageCost) || 0,
        processingCost: Number(processingCost) || 0,
        otherCost: Number(otherCost) || 0,
        profit: Number(profit) || 0,
        productImage: req.file?.filename || "",
      });

      await newPurchase.save();

      res.status(201).json({
        message: "Distributor product added",
        purchase: newPurchase,
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