const express = require("express");
const router = express.Router();
const DistributorPurchase = require("../models/DistributorPurchase");
const AddProduct = require("../models/AddProduct");
const { protect } = require("../middleware/authMiddleware");

// POST - Create Purchase
router.post("/", protect, async (req, res) => {
  try {
    const user = req.user;

    const {
      productId,
      quantity,
      buyerName,
      variety,
      pricePerKg,
      totalPrice,
      farmerId,
    } = req.body;

    if (!productId || !quantity || !farmerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await AddProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock available" });
    }

    const purchase = new DistributorPurchase({
      product: productId,
      farmer: farmerId,
      buyer: user._id,
      buyerName,
      variety,
      quantity,
      pricePerKg,
      totalPrice,
      status: "completed",
    });

    await purchase.save();

    // Reduce stock
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Purchase recorded successfully",
      purchase,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// GET all products bought by logged-in distributor
router.get("/my-purchases", protect, async (req, res) => {
  try {
    const distributorId = req.user.id;

    const purchases = await DistributorPurchase.find({
      buyer: distributorId,
      status: "completed"
    })
      .populate("product")
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error("Distributor purchases error:", err);
    res.status(500).json({ message: "Failed to load purchases" });
  }
});
// routes/distributorPurchaseRoutes.js
router.get("/my-sales", protect, async (req, res) => {
  try {
    const farmerId = req.user._id;

    const sales = await DistributorPurchase.find({
      farmer: farmerId,
      status: "completed",
    })
      .populate("product", "variety image")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (err) {
    console.error("Farmer sales error:", err);
    res.status(500).json({ message: "Failed to load sales" });
  }
});

 

module.exports = router;