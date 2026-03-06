const mongoose = require("mongoose");

const pestSchema = new mongoose.Schema({
  pestName: String,
  pesticide: String,
  sprays: Number,
  lastSpray: Date,
});

const addProductSchema = new mongoose.Schema(
  {
    // Basic Details
    riceType: { type: String, required: true },
    category: { type: String, required: true },
    variety: { type: String, required: true },
    season: { type: String, required: true },
    sowingDate: { type: Date, required: true },
    harvestDate: { type: Date, required: true },

    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    negotiable: { type: String, enum: ["Yes", "No"] },
image: {
  type: String,
},

    // Cultivation Details
    soilType: String,
    irrigationType: String,
    seedSource: String,
    privateCompany: String,

    fertilizer: String,
    fertilizerQty: Number,
    applications: Number,
    lastFertilizerDate: Date,

    // Pest Details
    diseaseOccurred: String,
    pests: [pestSchema],

    // Quality Parameters
    grainLength: Number,
    broken: Number,
    moisture: Number,
    color: String,
    foreignMatter: Number,
    damaged: Number,
    polishing: String,
    aging: String,

    // Link Product to Farmer
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // approval / marketplace information
    status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    qualityGrade: String,
    adminRating: Number,
    minPrice: Number,
    maxPrice: Number,
    // optional distributor selected by farmer
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // track approval decision from distributor
    distributorApprovalStatus: {
      type: String,
      enum: ["none","pending","approved","rejected"],
      default: "none",
    },
    blockchainTxHash: {
     type: String,
    default: null,
},
geoLocation: {
  lat: Number,
  lng: Number
},blockchainHistory: {
    type: [
      {
        action: String,
        txHash: String,
        actor: String,
        price: Number,
        timestamp: Date
      }
    ],
    default: []
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddProduct", addProductSchema);
