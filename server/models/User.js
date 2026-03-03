// server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["farmer", "consumer", "distributor", "retailer", "admin"],
      required: true,
    },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    state: String,
    district: String,
    address: String,

    licenseId: String,
    licenseFile: String,

    isVerified: {
      type: Boolean,
      default: false, // admin verifies later
    },
  },
  { timestamps: true }
);

// Make the combination of email + role unique (same email allowed with different roles)
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);