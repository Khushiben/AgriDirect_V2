const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const RetailerPurchase = require("../models/RetailerPurchase");

// 🔹 Get logged-in retailer purchases
router.get("/my-purchases", protect, async (req, res) => {
  try {
    if (req.user.role !== "retailer") {
      return res.status(403).json({ message: "Only retailer allowed" });
    }

    const purchases = await RetailerPurchase.find({
      retailer: req.user._id
    }).sort({ createdAt: -1 });

    res.json(purchases);

  } catch (error) {
    console.error("Fetch retailer purchases error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;