/**
 * Seed one demo user per role for easy login and demos.
 * Run from repo root: node server/scripts/seedDemoUsers.js
 * Or from server/: npm run seed
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
    email: "admin@agri.com",
    password: "agri123",
    name: "Kiran Patel (Admin)",
    phone: "9000000000",
    state: "Gujarat",
    district: "Anand",
    address: "AgriDirect Office, GIDC Estate, Anand, Gujarat - 388001",
    profilePicture: "https://randomuser.me/api/portraits/men/75.jpg"
  },
];

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected for seed");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  const User = require("../models/User");
  const hashedPassword = await bcrypt.hash("agri123", 10);

  // Delete all existing users first
  console.log("🗑️  Deleting all existing users...");
  await User.deleteMany({});
  console.log("✅ All users deleted");

  for (const u of demoUsers) {
    await User.findOneAndUpdate(
      { email: u.email, role: u.role },
      {
        $set: {
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
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${u.role}: ${u.email} - ${u.name}`);
  }

  console.log("✅ Demo users seeded. Password for all: agri123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
