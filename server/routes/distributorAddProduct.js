// server/routes/distributorAddProductRoutes.js
const express = require("express");
const router = express.Router();
const FarmerProduct = require("../models/AddProduct");  
const AddProduct = require("../models/distributorAddProduct"); 
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // ✅ use existing middleware

// POST - distributor adds product
router.post("/add", protect, upload.single("productImage"), async (req, res) => {
 try {
    if (req.user.role !== "distributor") {
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
    const product = await FarmerProduct.findById(productId);
   console.log("Found product:", product);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.quantity)
      return res.status(400).json({ message: "Not enough stock" });

    product.quantity -= Number(quantity);
    await product.save();

    const newPurchase = new AddProduct({
      product: productId,
      farmer: product.farmer,
      buyer: req.user._id,
      buyerName: req.user.name,
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
      productImage: req.file?.filename || "",
    });

    await newPurchase.save();

    res.status(201).json({ message: "Distributor product added", purchase: newPurchase });
  } catch (err) {
    console.error("Error adding distributor product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;