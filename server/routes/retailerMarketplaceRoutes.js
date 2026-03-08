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
    console.log("Fetching retailer marketplace products...");
    
    const products = await RetailerMarketplace.find({
      status: "available"
    })
    .populate('retailer', 'name email')
    .populate('originalPurchase')
    .sort({ createdAt: -1 });

    console.log(`Found ${products.length} retailer marketplace products`);
    
    // Debug: Log each product
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product._id,
        variety: product.variety,
        quantity: product.quantity,
        price: product.price,
        status: product.status,
        retailer: product.retailer?.name
      });
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching retailer marketplace products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;