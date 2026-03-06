const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const RetailerMarketplace = require("../models/RetailerMarketplace");

router.post("/add", protect, async (req, res) => {
  try {
    if (req.user.role !== "retailer") {
      return res.status(403).json({ message: "Only retailer allowed" });
    }

    const newProduct = await RetailerMarketplace.create({
      retailer: req.user._id,
      retailerName: req.user.name,
      originalPurchase: req.body.purchaseId,
      variety: req.body.variety,
      quantity: req.body.quantity,
      price: req.body.price,
      logisticCost: req.body.logisticCost,   // ✅ ADDED
      totalPrice: req.body.totalPrice,       // ✅ ADDED
      productImage: req.body.productImage
    });

    res.status(201).json(newProduct);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const products = await RetailerMarketplace.find({
      status: "available"
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;