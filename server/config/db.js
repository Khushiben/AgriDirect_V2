// server/config/db.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agriconnect";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;