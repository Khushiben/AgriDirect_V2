const mongoose = require("mongoose");

const mandiPriceSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    enum: ["Ahmedabad", "Anand", "Vadodara"]
  },
  market: {
    type: String,
    required: true
  },
  commodity: {
    type: String,
    required: true
  },
  variety: {
    type: String,
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "Quintal"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index to query by district efficiently
mandiPriceSchema.index({ district: 1, commodity: 1 });

module.exports = mongoose.model("MandiPrice", mandiPriceSchema);
