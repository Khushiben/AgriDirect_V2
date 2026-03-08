const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        capacity: { type: Number, required: true }, // Total capacity in kg/m³
        usedCapacity: { type: Number, default: 0 },
        pricePerKg: { type: Number, required: true },
        location: {
            state: String,
            district: String,
            address: String,
        },
        description: String,
        image: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Storage", storageSchema);
