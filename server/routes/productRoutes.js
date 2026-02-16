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

    const productData = {
      ...req.body,
      image: req.file ? req.file.filename : null,
    farmer: req.user._id  };

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


module.exports = router;
