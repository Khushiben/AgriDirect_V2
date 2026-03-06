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
    email: "farmer@demo.com",
    password: "demo123",
    name: "Ramesh Kumar",
    phone: "9876543210",
    state: "Punjab",
    district: "Ludhiana",
    address: "Village Green Farm, Ludhiana",
  },
  {
    role: "consumer",
    email: "consumer@demo.com",
    password: "demo123",
    name: "Priya Sharma",
    phone: "9123456789",
    state: "Maharashtra",
    district: "Mumbai",
    address: "45 Andheri East, Mumbai",
  },
  {
    role: "distributor",
    email: "distributor@demo.com",
    password: "demo123",
    name: "Vijay Agro Traders",
    phone: "9988776655",
    state: "Gujarat",
    district: "Ahmedabad",
    address: "Wholesale Market, Ahmedabad",
  },
  {
    role: "retailer",
    email: "retailer@demo.com",
    password: "demo123",
    name: "Fresh Mart Store",
    phone: "9765432101",
    state: "Karnataka",
    district: "Bangalore",
    address: "MG Road, Bangalore",
  },
  {
    role: "admin",
    email: "admin@demo.com",
    password: "demo123",
    name: "AgriDirect Admin",
    phone: "9000000000",
    state: "Delhi",
    district: "New Delhi",
    address: "Admin Office, New Delhi",
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
  const hashedPassword = await bcrypt.hash("demo123", 10);

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
          role: u.role,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${u.role}: ${u.email}`);
  }

  console.log("✅ Demo users seeded. Password for all: demo123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
