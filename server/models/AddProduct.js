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
      ref: "User",required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddProduct", addProductSchema);
