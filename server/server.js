// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

const app = express();

// DB
connectDB().then(async () => {
  // Clean up old email unique index if it exists
  try {
    const User = require("./models/User");
    await User.collection.dropIndex("email_1");
    console.log("✅ Old email unique index dropped");
  } catch (err) {
    // Index might not exist, that's fine
    if (!err.message.includes("index not found")) {
      console.log("ℹ️ No old index to drop");
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server error. Please try again." });
});

// Server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);