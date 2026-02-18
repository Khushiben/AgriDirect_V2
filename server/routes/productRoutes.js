const express = require("express");
const router = express.Router();
const AddProduct = require("../models/AddProduct");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");


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
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
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

    const product = await AddProduct.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("farmer", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // optionally: here you could fire off email/notification to farmer
    // for now the frontend will show an alert when they next fetch products

    res.json(product);
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


module.exports = router;
