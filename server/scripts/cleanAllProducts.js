/**
 * Clean all products from all collections
 * Run from repo root: node server/scripts/cleanAllProducts.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnect";

async function cleanAllProducts() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  try {
    // Import all product-related models
    const AddProduct = require("../models/AddProduct");
    const DistributorPurchase = require("../models/DistributorPurchase");
    const DistributorMarketplace = require("../models/distributorAddProduct");
    const RetailerPurchase = require("../models/RetailerPurchase");
    const RetailerMarketplace = require("../models/RetailerMarketplace");
    const MarketplaceProduct = require("../models/MarketplaceProduct");

    console.log("\n🗑️  Deleting all products from all collections...\n");

    // Delete from all collections
    const result1 = await AddProduct.deleteMany({});
    console.log(`  ✓ Deleted ${result1.deletedCount} products from AddProduct (Farmer Products)`);

    const result2 = await DistributorPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${result2.deletedCount} products from DistributorPurchase`);

    const result3 = await DistributorMarketplace.deleteMany({});
    console.log(`  ✓ Deleted ${result3.deletedCount} products from DistributorMarketplace`);

    const result4 = await RetailerPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${result4.deletedCount} products from RetailerPurchase`);

    const result5 = await RetailerMarketplace.deleteMany({});
    console.log(`  ✓ Deleted ${result5.deletedCount} products from RetailerMarketplace`);

    const result6 = await MarketplaceProduct.deleteMany({});
    console.log(`  ✓ Deleted ${result6.deletedCount} products from MarketplaceProduct`);

    const totalDeleted = result1.deletedCount + result2.deletedCount + result3.deletedCount + 
                         result4.deletedCount + result5.deletedCount + result6.deletedCount;

    console.log(`\n✅ Successfully deleted ${totalDeleted} total products from all collections!`);
    console.log("✅ All dashboards and marketplaces are now clean.\n");

  } catch (error) {
    console.error("❌ Error cleaning products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    process.exit(0);
  }
}

cleanAllProducts().catch((err) => {
  console.error("Clean error:", err);
  process.exit(1);
});
