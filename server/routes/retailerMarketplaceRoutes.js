const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const RetailerMarketplace = require("../models/RetailerMarketplace");

router.post("/add", protect, async (req, res) => {
  try {
    if (req.user.role !== "retailer") {
      return res.status(403).json({ message: "Only retailer allowed" });
    }

    // Generate retailer listing transaction hash
    const retailerListingTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newProduct = await RetailerMarketplace.create({
      retailer: req.user._id,
      retailerName: req.user.name,
      originalPurchase: req.body.purchaseId,
      variety: req.body.variety,
      quantity: req.body.quantity,
      price: req.body.price,
      logisticCost: req.body.logisticCost,
      totalPrice: req.body.totalPrice,
      productImage: req.body.productImage,
      distributorName: req.body.distributorName,
      farmerName: req.body.farmerName || "Unknown Farmer",
      farmerLocation: req.body.farmerLocation || "Unknown Location",
      farmerSoldPrice: req.body.farmerSoldPrice || 0,
      distributorSoldPrice: req.body.distributorSoldPrice || 0,
      adminApprovalTx: req.body.adminApprovalTx || "N/A",
      distributorPurchaseTx: req.body.distributorPurchaseTx || "N/A",
      distributorListingTx: req.body.distributorListingTx || "N/A",
      retailerPurchaseTx: req.body.retailerPurchaseTx || "N/A",
      retailerListingTx: retailerListingTx,
      blockchainHistory: req.body.blockchainHistory || []
    });

    res.status(201).json({
      ...newProduct.toObject(),
      txHash: retailerListingTx
    });

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

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await RetailerMarketplace.findById(req.params.id)
      .populate('retailer', 'name email')
      .populate('originalPurchase');
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Consumer purchase endpoint
router.post("/:id/purchase", protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await RetailerMarketplace.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    
    // Reduce quantity
    product.quantity -= quantity;
    
    // Update status if out of stock
    if (product.quantity === 0) {
      product.status = "sold";
    }
    
    await product.save();
    
    console.log(`✅ Consumer purchase: ${quantity}kg of ${product.variety}`);
    
    res.json({ 
      message: "Purchase successful",
      product: product
    });
  } catch (error) {
    console.error("Error processing consumer purchase:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;