const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/retailer-products", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const products = await db
      .collection("distributortomarketplaces") // ✅ CORRECT NAME
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Products found:", products.length);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching retailer products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;