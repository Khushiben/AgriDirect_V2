const mongoose = require("mongoose");

const storageBookingSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Storage",
            required: true,
        },
        capacityBooked: { type: Number, required: true },
        usedCapacity: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["PENDING", "ACTIVE", "COMPLETED"],
            default: "ACTIVE"
        },
        stockDetails: {
            keep: { type: Number, default: 0 },
            remove: { type: Number, default: 0 }
        },
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "AddProduct" },
            productName: String,
            quantity: Number,
            addedAt: { type: Date, default: Date.now }
        }],
        extendRequest: {
            requested: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
            approved: { type: Boolean, default: false }
        },
        takeoutSchedule: {
            requested: { type: Boolean, default: false },
            date: { type: Date },
            vehicleType: { type: String, default: "Standard" },
            status: { type: String, enum: ["PENDING", "APPROVED", "COMPLETED"], default: "PENDING" }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("StorageBooking", storageBookingSchema);
