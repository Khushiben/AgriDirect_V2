/**
 * Clean all products and data from database
 * Run: node server/scripts/cleanAllData.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnect";

async function cleanAll() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected for cleaning");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  try {
    // Import all models
    const AddProduct = require("../models/AddProduct");
    const MarketplaceProduct = require("../models/MarketplaceProduct");
    const DistributorPurchase = require("../models/DistributorPurchase");
    const RetailerPurchase = require("../models/RetailerPurchase");
    const RetailerMarketplace = require("../models/RetailerMarketplace");
    const DistributorAddProduct = require("../models/distributorAddProduct");

    console.log("\n🗑️  Cleaning all data...\n");

    // Delete all products
    const addProductCount = await AddProduct.deleteMany({});
    console.log(`  ✓ Deleted ${addProductCount.deletedCount} farmer products`);

    const marketplaceCount = await MarketplaceProduct.deleteMany({});
    console.log(`  ✓ Deleted ${marketplaceCount.deletedCount} marketplace products`);

    const distPurchaseCount = await DistributorPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${distPurchaseCount.deletedCount} distributor purchases`);

    const retailPurchaseCount = await RetailerPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${retailPurchaseCount.deletedCount} retailer purchases`);

    const retailMarketCount = await RetailerMarketplace.deleteMany({});
    console.log(`  ✓ Deleted ${retailMarketCount.deletedCount} retailer marketplace products`);

    const distAddProductCount = await DistributorAddProduct.deleteMany({});
    console.log(`  ✓ Deleted ${distAddProductCount.deletedCount} distributor added products`);

    console.log("\n✅ All data cleaned successfully!");
    console.log("💡 Run 'node server/scripts/seedDemoUsers.js' to recreate demo users\n");

  } catch (err) {
    console.error("❌ Error cleaning data:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanAll().catch((err) => {
  console.error("Clean error:", err);
  process.exit(1);
});
