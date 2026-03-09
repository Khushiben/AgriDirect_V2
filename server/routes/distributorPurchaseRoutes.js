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

    console.log("📦 Creating purchase:", {
      productId,
      quantity,
      buyerName,
      variety,
      pricePerKg,
      totalPrice,
      farmerId,
      buyer: user._id
    });

    if (!productId || !quantity || !farmerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await AddProduct.findById(productId).populate('farmer', 'name address').populate('assignedAdmin', 'name');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock available" });
    }

    // Generate purchase transaction hash
    const purchaseTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const purchase = new DistributorPurchase({
      product: productId,
      farmer: farmerId,
      buyer: user._id,
      buyerName: buyerName || user.name,
      variety,
      quantity,
      pricePerKg,
      totalPrice,
      status: "completed",
      purchaseTxHash: purchaseTxHash,
      farmerName: product.farmer?.name || "Unknown Farmer",
      farmerLocation: product.farmer?.address || "Unknown Location",
      adminApprovalTx: product.blockchainTxHash || "N/A",
      adminName: product.assignedAdmin?.name || "Unknown Admin"
    });

    await purchase.save();
    console.log("✅ Purchase saved:", purchase._id);

    // Reduce stock
    product.quantity -= quantity;
    await product.save();
    console.log("✅ Stock reduced. New quantity:", product.quantity);

    res.status(201).json({
      success: true,
      message: "Purchase recorded successfully",
      purchase,
      txHash: purchaseTxHash
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// GET all products bought by logged-in distributor
router.get("/my-purchases", protect, async (req, res) => {
  try {
    const distributorId = req.user._id;
    console.log("🔍 Fetching purchases for distributor:", distributorId);

    const purchases = await DistributorPurchase.find({
      buyer: distributorId,
      status: "completed"
    })
      .populate("product")
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 });

    console.log("✅ Found purchases:", purchases.length);
    res.json(purchases);
  } catch (err) {
    console.error("Distributor purchases error:", err);
    res.status(500).json({ message: "Failed to load purchases", error: err.message });
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