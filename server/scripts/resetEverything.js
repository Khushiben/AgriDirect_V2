/**
 * Reset everything - Clean all products and reseed demo users
 * Run from repo root: node server/scripts/resetEverything.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnect";

const demoUsers = [
  {
    role: "farmer",
    email: "farmer@agri.com",
    password: "agri123",
    name: "Shubham",
    phone: "9876543210",
    state: "Gujarat",
    district: "Anand",
    address: "MBIT Anand IND",
    farmSize: "5",
    profilePicture: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    role: "consumer",
    email: "consumer@agri.com",
    password: "agri123",
    name: "Priya Mehta Shah",
    phone: "9123456789",
    state: "Gujarat",
    district: "Anand",
    address: "Sardar Patel Nagar, Near AMUL Dairy, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    role: "distributor",
    email: "distributor@agri.com",
    password: "agri123",
    name: "Vijay Singh (Agro Traders)",
    phone: "9988776655",
    state: "Gujarat",
    district: "Anand",
    address: "Shop No. 12, APMC Market, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/men/52.jpg"
  },
  {
    role: "retailer",
    email: "retailer@agri.com",
    password: "agri123",
    name: "Anjali Desai (Fresh Mart)",
    phone: "9765432101",
    state: "Gujarat",
    district: "Anand",
    address: "Station Road, Opposite Railway Station, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    role: "admin",
    email: "admin1@agri.com",
    password: "agri123",
    name: "Kiran Patel",
    phone: "9000000001",
    state: "Gujarat",
    district: "Anand",
    address: "AgriDirect Office, GIDC Estate, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    role: "admin",
    email: "admin2@agri.com",
    password: "agri123",
    name: "Neha Sharma",
    phone: "9000000002",
    state: "Gujarat",
    district: "Anand",
    address: "AgriDirect Office, GIDC Estate, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

async function resetEverything() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected\n");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  try {
    // ========== STEP 1: Clean all products ==========
    console.log("🗑️  STEP 1: Cleaning all products...\n");
    
    const AddProduct = require("../models/AddProduct");
    const DistributorPurchase = require("../models/DistributorPurchase");
    const DistributorMarketplace = require("../models/distributorAddProduct");
    const RetailerPurchase = require("../models/RetailerPurchase");
    const RetailerMarketplace = require("../models/RetailerMarketplace");
    const MarketplaceProduct = require("../models/MarketplaceProduct");

    const result1 = await AddProduct.deleteMany({});
    console.log(`  ✓ Deleted ${result1.deletedCount} from AddProduct (Farmer Products)`);

    const result2 = await DistributorPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${result2.deletedCount} from DistributorPurchase`);

    const result3 = await DistributorMarketplace.deleteMany({});
    console.log(`  ✓ Deleted ${result3.deletedCount} from DistributorMarketplace`);

    const result4 = await RetailerPurchase.deleteMany({});
    console.log(`  ✓ Deleted ${result4.deletedCount} from RetailerPurchase`);

    const result5 = await RetailerMarketplace.deleteMany({});
    console.log(`  ✓ Deleted ${result5.deletedCount} from RetailerMarketplace`);

    const result6 = await MarketplaceProduct.deleteMany({});
    console.log(`  ✓ Deleted ${result6.deletedCount} from MarketplaceProduct`);

    const totalDeleted = result1.deletedCount + result2.deletedCount + result3.deletedCount + 
                         result4.deletedCount + result5.deletedCount + result6.deletedCount;

    console.log(`\n✅ Deleted ${totalDeleted} total products from all collections!\n`);

    // ========== STEP 2: Reseed demo users ==========
    console.log("👥 STEP 2: Reseeding demo users...\n");
    
    const User = require("../models/User");
    const hashedPassword = await bcrypt.hash("agri123", 10);

    // Delete all existing users
    await User.deleteMany({});
    console.log("  ✓ Deleted all existing users");

    // Create new demo users
    for (const u of demoUsers) {
      await User.create({
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: hashedPassword,
        state: u.state,
        district: u.district,
        address: u.address,
        farmSize: u.farmSize || "",
        profilePicture: u.profilePicture || "",
        role: u.role,
        isVerified: true,
      });
      console.log(`  ✓ Created ${u.role}: ${u.email} - ${u.name}`);
    }

    console.log("\n✅ All demo users seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("   Email: farmer@agri.com | Password: agri123 | Name: Shubham");
    console.log("   Email: consumer@agri.com | Password: agri123");
    console.log("   Email: distributor@agri.com | Password: agri123");
    console.log("   Email: retailer@agri.com | Password: agri123");
    console.log("   Email: admin1@agri.com | Password: agri123");
    console.log("   Email: admin2@agri.com | Password: agri123");
    console.log("\n✅ Database reset complete! Ready for fresh start.\n");

  } catch (error) {
    console.error("❌ Error during reset:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    process.exit(0);
  }
}

resetEverything().catch((err) => {
  console.error("Reset error:", err);
  process.exit(1);
});
