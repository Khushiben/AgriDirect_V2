/**
 * Verify only @agri.com users exist
 * Run: node server/scripts/verifyUsers.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnect";

async function verifyUsers() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected\n");
    
    const User = require("../models/User");
    
    // Get all users
    const allUsers = await User.find({}).select("email name role");
    console.log(`📊 Total users in database: ${allUsers.length}\n`);
    
    // Check for @agri.com users
    const agriUsers = allUsers.filter(u => u.email.endsWith("@agri.com"));
    console.log(`✅ @agri.com users: ${agriUsers.length}`);
    agriUsers.forEach(u => {
      console.log(`   - ${u.role}: ${u.email} (${u.name})`);
    });
    
    // Check for @demo.com users
    const demoUsers = allUsers.filter(u => u.email.endsWith("@demo.com"));
    if (demoUsers.length > 0) {
      console.log(`\n⚠️  @demo.com users found: ${demoUsers.length}`);
      demoUsers.forEach(u => {
        console.log(`   - ${u.role}: ${u.email} (${u.name})`);
      });
    } else {
      console.log(`\n✅ No @demo.com users found - database is clean!`);
    }
    
    // Check for other domains
    const otherUsers = allUsers.filter(u => !u.email.endsWith("@agri.com") && !u.email.endsWith("@demo.com"));
    if (otherUsers.length > 0) {
      console.log(`\n📧 Other email domains: ${otherUsers.length}`);
      otherUsers.forEach(u => {
        console.log(`   - ${u.role}: ${u.email} (${u.name})`);
      });
    }
    
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyUsers();
