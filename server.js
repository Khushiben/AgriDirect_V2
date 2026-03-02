// server/server.js
const express = require("express");
const cors = require("cors");

// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const distributorPurchaseRoutes = require("./routes/distributorPurchaseRoutes");
// const connectDB = require("./config/db");

const app = express();

// DB - disabled for now
// connectDB().then(async () => {
//   try {
//     const User = require("./models/User");
//     await User.collection.dropIndex("email_1");
//     console.log("✅ Old email unique index dropped");
//   } catch (err) {
//     if (!err.message.includes("index not found")) {
//       console.log("ℹ️ No old index to drop");
//     }
//   }
// });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes - disabled for now
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/distributor-purchases", distributorPurchaseRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server error. Please try again." });
});

// Server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
