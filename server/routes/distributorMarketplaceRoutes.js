const express = require("express");
const router = express.Router();
const DistributorProduct = require("../models/distributorAddProduct");
const { protect } = require("../middleware/authMiddleware");

// GET - Logged-in distributor's marketplace products
router.get("/my-products", protect, async (req, res) => {
  try {
    console.log("---- /my-products route hit ----");
    console.log("Logged in user:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const distributorId = req.user._id;
    console.log("Distributor ID:", distributorId);

    const products = await DistributorProduct.find({
      buyer: distributorId,
    })
      .populate("farmer", "name email")
      .populate("product", "variety image")
      .sort({ createdAt: -1 });

    console.log("Products found:", products.length);

    res.json(products);
  } catch (error) {
    console.error("Error fetching marketplace products:", error);
    res.status(500).json({ message: "Failed to load marketplace products" });
  }
});

// GET - Public marketplace for retailers to see available products
router.get("/", async (req, res) => {
  try {
    console.log("---- Public marketplace route hit ----");
    
    const products = await DistributorProduct.find({
      status: "available"
    })
      .populate("distributor", "name email")
      .populate("product", "variety image")
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} available distributor products for retailers`);
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching public marketplace products:", error);
    res.status(500).json({ message: "Failed to load marketplace products" });
  }
});

// GET single distributor marketplace product by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("---- /:id route hit ----");
    console.log("Requested ID:", req.params.id);

    const product = await DistributorProduct.findById(req.params.id)
      .populate("farmer", "name email")
      .populate("product", "variety image");

    if (!product) {
      console.log("No product found with that ID");
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product found:", product._id);

    res.json(product);

  } catch (error) {
    console.error("Error fetching distributor marketplace product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;