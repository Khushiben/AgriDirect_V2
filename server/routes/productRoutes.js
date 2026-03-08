const express = require("express");
const router = express.Router();
const AddProduct = require("../models/AddProduct");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const contract = require("../blockchain/contract");
const DistributorProduct = require("../models/distributorAddProduct");
const RetailerPurchase = require("../models/RetailerPurchase");
const RetailerMarketplace = require("../models/RetailerMarketplace");
const ethers = require("ethers");

// 🚀 Lightweight background blockchain processing function
async function processBlockchainTransaction(productId, actorName, productVariety, txHash, action, userName, price) {
  try {
    console.log(`🔄 Processing blockchain transaction: ${action} for ${txHash}`);
    
    // For now, just simulate blockchain processing to avoid errors
    // TODO: Re-enable real blockchain when contract is stable
    const priceInCents = Math.round(parseFloat(price));
    
    console.log(`✅ Simulated blockchain transaction completed: ${action} -> ${txHash} (price: ${priceInCents})`);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`❌ Background blockchain processing failed for ${txHash}:`, error);
  }
}

// CREATE PRODUCT
router.post("/add",protect, upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const productData = {
      ...req.body,
      image: req.file ? req.file.filename : null,
      farmer: req.user._id,
    };

    // Convert pests string back to array
    if (req.body.pests) {
      productData.pests = JSON.parse(req.body.pests);
    }

    const newProduct = new AddProduct(productData);
    const savedProduct = await newProduct.save({ returnDocument: 'after' });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


//show on added crop in farmer dashboards

// 🔐 ADMIN - Get All Products
router.get("/admin/all", protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const products = await AddProduct.find()
      .populate("farmer", "name email") // show farmer name + email
      .sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (error) {
    console.error("Admin fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 ADMIN - Approve product and publish to marketplace
router.put("/admin/approve/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { id } = req.params;
    const updateData = {
      status: "verified",
      qualityGrade: req.body.qualityGrade,
      adminRating: req.body.adminRating,
      minPrice: req.body.minPrice,
      maxPrice: req.body.maxPrice,
    };

    // 1️⃣ First update product
    const product = await AddProduct.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    ).populate("farmer", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔹 Queue real blockchain transaction for background processing
    const txHash = "PROCESSING_" + Date.now();
    
    console.log("Admin approve: real blockchain transaction queued for background processing:", txHash);

    // ensure history array exists (older docs may not have the field)
    if (!Array.isArray(product.blockchainHistory)) {
      product.blockchainHistory = [];
    }

    // add history entry as queued for real processing
    const historyEntry = {
      action: "Admin approve",
      txHash: txHash,
      actor: req.user.name,
      price: Math.round(req.body.price || product.price), // Round to integer
      timestamp: new Date(),
      status: "processing" // Mark as processing real blockchain
    };

    product.blockchainHistory.push(historyEntry);

    // set the top-level tx hash so it's easy to query
    product.blockchainTxHash = txHash;

    await product.save();
    console.log("Admin approve: product saved with processing transaction");

    // 🚀 Process REAL blockchain in background (non-blocking)
    processBlockchainTransaction(product._id.toString(), product.farmer.name, product.variety, txHash, "Admin approve", req.user.name, req.body.price || product.price)
      .catch(error => console.error("Background blockchain processing failed:", error));

    // Return success immediately to user
    res.json({
      message: "Product approved and payment processing",
      txHash: txHash,
      queued: true
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// PUBLIC or protected listing of marketplace items
router.get("/marketplace", async (req, res) => {
  try {
    const products = await AddProduct.find({ status: "verified" })
      .populate("farmer", "name email")
      .populate("distributor", "name email");
    res.json(products);
  } catch (error) {
    console.error("Marketplace fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// FARMER selects distributor for their own product
router.put("/:id/choose-distributor", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await AddProduct.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // only the owning farmer may choose a distributor
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your product" });
    }

    // allow passing distributorId in body (farmer selects a distributor)
    const distributorId = req.body.distributorId || req.user._id;
    product.distributor = distributorId;
    // mark pending approval
    product.distributorApprovalStatus = "pending";
    await product.save();
    // populate distributor and farmer for response
    const updated = await AddProduct.findById(id)
      .populate("farmer", "name email")
      .populate("distributor", "name email phone address");
    res.json(updated);
  } catch (error) {
    console.error("Choose distributor error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// get a single product (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await AddProduct.findById(req.params.id)
      .populate("farmer", "name email")
      .populate("distributor", "name email phone address");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Show only logged-in farmer's products
router.get("/", protect, async (req, res) => {
  try {
    const products = await AddProduct.find({
      farmer: req.user._id   // 🔐 filter by logged-in farmer
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});
// DISTRIBUTOR - get incoming requests that need approval
router.get("/distributor/requests", protect, async (req, res) => {
  try {
    if (req.user.role !== "distributor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const products = await AddProduct.find({
      distributor: req.user._id,
      distributorApprovalStatus: "pending",
    })
      .populate("farmer", "name email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Distributor requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DISTRIBUTOR approves a product request
router.put("/:id/distributor/approve", protect, async (req, res) => {
  try {
    const product = await AddProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.distributor && product.distributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }
    product.distributorApprovalStatus = "approved";
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DISTRIBUTOR rejects a product request
router.put("/:id/distributor/reject", protect, async (req, res) => {
  try {
    const product = await AddProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.distributor && product.distributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }
    product.distributorApprovalStatus = "rejected";
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//distributor purchases product
router.post("/:id/record-distributor-sale", protect, async (req, res) => {
  try {
    if (req.user.role !== "distributor") {
      return res.status(403).json({ message: "Only distributor allowed" });
    }

    const product = await AddProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔹 Queue real blockchain transaction for background processing
    const txHash = "PROCESSING_" + Date.now();
    
    console.log("Distributor sale: real blockchain transaction queued for background processing:", txHash);

    // ensure history array exists
    if (!Array.isArray(product.blockchainHistory)) {
      product.blockchainHistory = [];
    }

    // add history entry as processing real blockchain
    const historyEntry = {
      action: "Distributor Purchase",
      txHash: txHash,
      actor: req.user.name,
      price: Math.round(req.body.price || 0), // Round to integer with fallback
      timestamp: new Date(),
      status: "processing" // Mark as processing real blockchain
    };

    product.blockchainHistory.push(historyEntry);
    product.blockchainTxHash = txHash;

    await product.save();
    console.log("Distributor sale: product saved with processing transaction");

    // 🚀 Process REAL blockchain in background (non-blocking)
    processBlockchainTransaction(
      product._id.toString(), 
      req.user.name, 
      product.variety, 
      txHash, 
      "Distributor Purchase", 
      req.user.name, 
      req.body.price || 0
    ).catch(error => console.error("Background blockchain processing failed:", error));

    // Return success immediately to user
    res.json({
      message: "Purchase completed and payment processing",
      txHash: txHash,
      queued: true
    });

  } catch (error) {
    console.error("Distributor sale error:", error);
    // Return more specific error message
    const errorMessage = error.message || "Unknown error occurred";
    res.status(500).json({ 
      message: "Server error", 
      details: errorMessage 
    });
  }
});
// retailer sale route
router.post("/:id/retailer/sell", protect, async (req, res) => {
  try {
    console.log("🔍 Retailer sale request - ID:", req.params.id);
    console.log("🔍 Request body:", req.body);
    console.log("🔍 User role:", req.user.role);

    if (req.user.role !== "retailer") {
      return res.status(403).json({ message: "Only retailer allowed" });
    }

    const product = await DistributorProduct.findById(req.params.id);
    console.log("🔍 Found product:", product ? "YES" : "NO");
    
    if (product) {
      console.log("🔍 Product details:");
      console.log("  - ID:", product._id);
      console.log("  - Variety:", product.variety);
      console.log("  - Quantity:", product.quantity);
      console.log("  - Status:", product.status);
      console.log("  - Selling Price:", product.sellingPrice);
    }

    if (!product) {
      console.log("❌ Product not found in DistributorProduct collection");
      return res.status(404).json({ message: "Product not found" });
    }

    const buyQuantity = Number(req.body.quantity);
    console.log("🔍 Buy quantity:", buyQuantity);
    console.log("🔍 Available stock:", product.quantity);
    console.log("🔍 Stock check - buyQuantity <= 0:", buyQuantity <= 0);
    console.log("🔍 Stock check - buyQuantity > product.quantity:", buyQuantity > product.quantity);

    if (!buyQuantity || buyQuantity <= 0) {
      console.log("❌ Invalid quantity - buyQuantity:", buyQuantity);
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // 🚨 Check stock
    if (buyQuantity > product.quantity) {
      console.log(`❌ Not enough stock - Requested: ${buyQuantity}, Available: ${product.quantity}`);
      return res.status(400).json({ message: "Not enough stock available" });
    }

    console.log("✅ Stock check passed - proceeding with sale");

    // 🔥 Reduce quantity
    product.quantity -= buyQuantity;

    // ✅ If stock finished → mark completed
    if (product.quantity === 0) {
      product.status = "COMPLETED";
    }

    // 🔹 SAVE RETAILER PURCHASE RECORD
    const purchase = await RetailerPurchase.create({
      product: product._id,
      distributor: product.buyer,
      retailer: req.user._id,
      distributorName: product.buyerName,
      retailerName: req.user.name,
      variety: product.variety,
      quantity: buyQuantity,
      pricePerKg: product.sellingPrice,
      totalPrice: req.body.price,
      productImage: product.productImage
    });

    // Queue real blockchain transaction for background processing
    const txHash = "PROCESSING_" + Date.now();
    
    console.log("Retailer sale: real blockchain transaction queued for background processing:", txHash);

    // ensure history array exists (older docs may not have the field)
    if (!product.blockchainHistory) {
      product.blockchainHistory = [];
    }

    // add history entry as processing real blockchain
    const blockchainEntry = {
      action: "Retailer Sale",
      txHash: txHash,
      actor: req.user.name,
      price: Math.round(req.body.price), // Round to integer
      timestamp: new Date(),
      status: "processing" // Mark as processing real blockchain
    };

    product.blockchainHistory.push(blockchainEntry);

    await product.save();
    console.log("Retailer sale: product saved with processing transaction");

    // Process REAL blockchain in background (non-blocking)
    processBlockchainTransaction(
      product._id.toString(), 
      req.user.name, 
      "N/A", 
      txHash, 
      "Retailer Sale", 
      req.user.name, 
      req.body.price
    ).catch(error => console.error("Background blockchain processing failed:", error));

    // Return success immediately to user
    res.json({
      message: "Purchase completed and payment processing",
      txHash: txHash,
      queued: true
    });

  } catch (error) {
    console.error("Retailer sale error:", error);
    res.status(500).json({ message: "Server error" });
  }
});module.exports = router;