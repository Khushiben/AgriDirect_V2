const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Storage = require("../models/Storage");
const AddProduct = require("../models/AddProduct");
const DistributorPurchase = require("../models/DistributorPurchase");
const MandiPrice = require("../models/MandiPrice");
const MarketplaceProduct = require("../models/MarketplaceProduct");
const RetailerMarketplace = require("../models/RetailerMarketplace");
const RetailerPurchase = require("../models/RetailerPurchase");
const Distributortomarketplace = require("../models/distributorAddProduct");
const StorageBooking = require("../models/StorageBooking");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const initUsers = async () => {
    try {
        console.log("🚀 Starting Aggressive Database Wipe...");

        const models = [
            User, Storage, AddProduct, DistributorPurchase,
            MandiPrice, MarketplaceProduct, RetailerMarketplace,
            RetailerPurchase, Distributortomarketplace, StorageBooking
        ];

        for (const model of models) {
            await model.deleteMany({});
            console.log(`🗑️ Erased everything in ${model.modelName}`);
        }

        const passwordMsg = "agri123";
        const password = await bcrypt.hash(passwordMsg, 10);

        // --- SEED PRECISE ACCOUNTS ---
        const seedData = [
            // 3 Admins
            { name: "Rajesh Kumar (Admin)", email: "admin1@agri.com", role: "admin", district: "Anand", state: "Gujarat" },
            { name: "Priya Sharma (Admin)", email: "admin2@agri.com", role: "admin", district: "Pune", state: "Maharashtra" },
            { name: "Vikram Singh (Admin)", email: "admin3@agri.com", role: "admin", district: "Jaipur", state: "Rajasthan" },

            // 4 Farmers with geoLocation
            {
                name: "Ramesh Patel", email: "farmer@agri.com", role: "farmer", district: "Anand", state: "Gujarat",
                geoLocation: { lat: 22.5645, lng: 72.9289 }
            },
            {
                name: "Suresh Desai", email: "farmer2@agri.com", role: "farmer", district: "Anand", state: "Gujarat",
                geoLocation: { lat: 22.5587, lng: 72.9345 }
            },
            {
                name: "Kishan Mehta", email: "farmer3@agri.com", role: "farmer", district: "Anand", state: "Gujarat",
                geoLocation: { lat: 22.5712, lng: 72.9223 }
            },
            {
                name: "Bhavesh Solanki", email: "farmer4@agri.com", role: "farmer", district: "Anand", state: "Gujarat",
                geoLocation: { lat: 22.5765, lng: 72.9256 }
            },

            // 3 Storage Users
            {
                name: "AgriFrost Cold Storage", email: "storage1@agri.com", role: "storage", district: "Anand", state: "Gujarat",
                storageConfig: { capacity: 500, pricePerKg: 12, description: "Small-scale temperature controlled storage for local farmers." }
            },
            {
                name: "ColdVault Premium", email: "storage2@agri.com", role: "storage", district: "Anand", state: "Gujarat",
                storageConfig: { capacity: 1500, pricePerKg: 18, description: "Mid-range cold storage with humidity control and 24/7 monitoring." }
            },
            {
                name: "MegaFreeze Warehouse", email: "storage3@agri.com", role: "storage", district: "Anand", state: "Gujarat",
                storageConfig: { capacity: 3000, pricePerKg: 25, description: "Industrial-grade cold storage with advanced climate control and massive capacity." }
            },

            // Distributors
            { name: "Agri Distributor", email: "distributor@agri.com", role: "distributor", district: "Anand", state: "Gujarat" },
            { name: "Anand Logistics", email: "dist1@agri.com", role: "distributor", district: "Anand", state: "Gujarat" },
            { name: "V.V. Nagar Dist", email: "dist2@agri.com", role: "distributor", district: "Anand", state: "Gujarat" },

            // Retailer & Consumer
            { name: "Agri Retailer", email: "retailer@agri.com", role: "retailer", district: "Anand", state: "Gujarat" },
            { name: "Agri Consumer", email: "consumer@agri.com", role: "consumer", district: "Anand", state: "Gujarat" }
        ];

        console.log("🌱 Seeding requested @agri.com accounts...");
        const users = {};
        for (const data of seedData) {
            const user = await User.create({
                name: data.name,
                email: data.email,
                role: data.role,
                password,
                phone: "9112233445",
                isVerified: true,
                address: data.district + " Agricultural Node",
                state: data.state,
                district: data.district,
            });
            users[data.email] = user;
            console.log(`✅ Created ${data.role}: ${data.email}`);

            // Create storage facility for storage users
            if (data.role === "storage" && data.storageConfig) {
                await Storage.create({
                    name: data.name + " Facility",
                    owner: user._id,
                    capacity: data.storageConfig.capacity,
                    pricePerKg: data.storageConfig.pricePerKg,
                    description: data.storageConfig.description,
                    location: {
                        state: data.state,
                        district: data.district,
                        address: data.district + " Industrial Complex",
                    },
                });
                console.log(`  ❄️ Storage facility created: ${data.storageConfig.capacity}kg @ ₹${data.storageConfig.pricePerKg}/kg`);
            }
        }

        // --- SEED FARMER PRODUCTS ---
        console.log("📦 Seeding Farmer Products with GeoLocation...");

        const farmerProducts = [
            {
                farmer: "farmer@agri.com",
                variety: "Basmati Rice",
                quantity: 5000,
                price: 60,
                riceType: "Long Grain",
                category: "Cereals",
                season: "Kharif",
                geoLocation: { lat: 22.5645, lng: 72.9289 }
            },
            {
                farmer: "farmer2@agri.com",
                variety: "Sona Masoori Rice",
                quantity: 3000,
                price: 45,
                riceType: "Medium Grain",
                category: "Cereals",
                season: "Rabi",
                geoLocation: { lat: 22.5587, lng: 72.9345 }
            },
            {
                farmer: "farmer3@agri.com",
                variety: "Jasmine Rice",
                quantity: 2000,
                price: 75,
                riceType: "Aromatic",
                category: "Premium",
                season: "Kharif",
                geoLocation: { lat: 22.5712, lng: 72.9223 }
            },
            {
                farmer: "farmer4@agri.com",
                variety: "Brown Rice (Organic)",
                quantity: 1500,
                price: 90,
                riceType: "Whole Grain",
                category: "Organic",
                season: "Kharif",
                geoLocation: { lat: 22.5765, lng: 72.9256 }
            }
        ];

        const createdProducts = [];
        for (const fp of farmerProducts) {
            const adminIndex = Math.floor(Math.random() * 3);
            const adminEmails = ["admin1@agri.com", "admin2@agri.com", "admin3@agri.com"];
            const assignedAdmin = users[adminEmails[adminIndex]];

            const product = await AddProduct.create({
                variety: fp.variety,
                quantity: fp.quantity,
                price: fp.price,
                farmer: users[fp.farmer]._id,
                assignedAdmin: assignedAdmin._id,
                status: "verified",
                harvestDate: new Date(),
                sowingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                season: fp.season,
                category: fp.category,
                riceType: fp.riceType,
                geoLocation: fp.geoLocation,
                blockchainTxHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
                blockchainHistory: [
                    {
                        action: "Product Created",
                        txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
                        actor: users[fp.farmer].name,
                        price: fp.price,
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    {
                        action: "Admin Verified",
                        txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
                        actor: assignedAdmin.name,
                        price: fp.price,
                        timestamp: new Date()
                    }
                ]
            });
            createdProducts.push(product);
            console.log(`  🌾 Created product: ${fp.variety} by ${fp.farmer} (Admin: ${adminEmails[adminIndex]})`);
        }

        // --- SEED D2D MARKETPLACE PRODUCTS ---
        console.log("📦 Initializing D2D Marketplace Products...");

        await Distributortomarketplace.create({
            product: createdProducts[0]._id,
            farmer: users["farmer@agri.com"]._id,
            buyer: users["dist1@agri.com"]._id,
            buyerName: "Anand Logistics",
            variety: "Basmati Rice (Premium)",
            quantity: 1000,
            purchasePrice: 60,
            sellingPrice: 85,
            status: "available",
            productImage: "rice.jpg"
        });

        await Distributortomarketplace.create({
            product: createdProducts[0]._id,
            farmer: users["farmer@agri.com"]._id,
            buyer: users["dist2@agri.com"]._id,
            buyerName: "V.V. Nagar Dist",
            variety: "Long Grain Basmati",
            quantity: 2000,
            purchasePrice: 60,
            sellingPrice: 82,
            status: "available",
            productImage: "rice.jpg"
        });

        console.log("✨ All clear. Environment is ready with admins, storage, farmers & D2D samples!");
    } catch (error) {
        console.error("❌ Reset error:", error);
    }
};

if (require.main === module) {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/agridirect";
    mongoose.connect(MONGO_URI)
        .then(async () => {
            console.log("📦 Connected to MongoDB...");
            await initUsers();
            mongoose.disconnect();
            process.exit(0);
        })
        .catch(err => {
            console.error("❌ Connection failed:", err);
            process.exit(1);
        });
}

module.exports = initUsers;
