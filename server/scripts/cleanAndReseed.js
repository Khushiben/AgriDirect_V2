/**
 * Clean ALL users and reseed only @agri.com demo users
 * Run: node server/scripts/cleanAndReseed.js
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
    name: "Ramesh Kumar Patel",
    phone: "9876543210",
    state: "Gujarat",
    district: "Anand",
    address: "Green Valley Farm, Village Karamsad, Anand, Gujarat - 388325",
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
    name: "Kiran Patel (Admin)",
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
    name: "Neha Sharma (Admin)",
    phone: "9000000002",
    state: "Gujarat",
    district: "Anand",
    address: "AgriDirect Office, GIDC Estate, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/women/65.jpg"
  },
];

async function cleanAndReseed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  try {
    const User = require("../models/User");
    
    // DELETE ALL USERS
    console.log("\n🗑️  Deleting ALL users from database...");
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
    
    // CREATE ONLY @agri.com USERS
    console.log("\n👥 Creating @agri.com demo users...\n");
    const hashedPassword = await bcrypt.hash("agri123", 10);

    for (const u of demoUsers) {
      const newUser = await User.create({
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
      console.log(`  ✓ ${u.role}: ${u.email} - ${u.name}`);
    }

    console.log("\n✅ All @agri.com demo users created!");
    console.log("🔑 Password for all: agri123\n");
    
    // Verify no @demo.com users exist
    const demoComUsers = await User.find({ email: /@demo\.com$/ });
    if (demoComUsers.length > 0) {
      console.log("⚠️  WARNING: Found @demo.com users, deleting...");
      await User.deleteMany({ email: /@demo\.com$/ });
      console.log("✅ All @demo.com users deleted");
    } else {
      console.log("✅ No @demo.com users found - database clean!");
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanAndReseed().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
