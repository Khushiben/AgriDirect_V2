const express = require("express");
const router = express.Router();
const Storage = require("../models/Storage");
const AddProduct = require("../models/AddProduct");
const StorageBooking = require("../models/StorageBooking");
const { protect } = require("../middleware/authMiddleware");

// GET all storage facilities
router.get("/", async (req, res) => {
    try {
        const storages = await Storage.find().populate("owner", "name email phone");
        res.json(storages);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET storage by owner (for dashboard) - supports both URLs
router.get("/my-facility", protect, async (req, res) => {
    try {
        const storage = await Storage.findOne({ owner: req.user._id });
        if (!storage) return res.json(null);
        res.json(storage);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/my-storage", protect, async (req, res) => {
    try {
        const storage = await Storage.findOne({ owner: req.user._id });
        if (!storage) return res.json(null);
        res.json(storage);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET pending/active requests for storage owner
router.get("/requests", protect, async (req, res) => {
    try {
        const storage = await Storage.findOne({ owner: req.user._id });
        if (!storage) return res.json([]);

        const bookings = await StorageBooking.find({ storage: storage._id })
            .populate("farmer", "name email phone district")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error("Requests fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Storage owner approves/rejects a request
router.put("/request/:id", protect, async (req, res) => {
    try {
        const { action } = req.body;
        const booking = await StorageBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (action === "approve") {
            booking.status = "ACTIVE";
        } else if (action === "reject") {
            // Return capacity to storage
            const storage = await Storage.findById(booking.storage);
            if (storage) {
                storage.usedCapacity = Math.max(0, storage.usedCapacity - booking.capacityBooked);
                await storage.save();
            }
            booking.status = "COMPLETED";
        }
        await booking.save();
        res.json({ message: `Request ${action}d`, booking });
    } catch (error) {
        console.error("Request action error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST - Book storage space
router.post("/book", protect, async (req, res) => {
    try {
        const { storageId, capacity, totalPrice } = req.body;
        const farmerId = req.user._id;

        const storage = await Storage.findById(storageId);
        if (!storage) return res.status(404).json({ message: "Storage not found" });

        if (storage.usedCapacity + capacity > storage.capacity) {
            return res.status(400).json({ message: "Insufficient storage capacity" });
        }

        // Fix: Check if farmer already has an ACTIVE booking for this storage
        let booking = await StorageBooking.findOne({
            farmer: farmerId,
            storage: storageId,
            status: "ACTIVE"
        });

        if (booking) {
            // Top up existing booking
            booking.capacityBooked += parseFloat(capacity);
            booking.totalPrice += parseFloat(totalPrice);
            await booking.save();
        } else {
            // Create new booking
            booking = await StorageBooking.create({
                farmer: farmerId,
                storage: storageId,
                capacityBooked: capacity,
                usedCapacity: 0,
                totalPrice,
                status: "ACTIVE"
            });
        }

        // Update used capacity on storage
        storage.usedCapacity += parseFloat(capacity);
        await storage.save();

        res.status(201).json({ message: "Storage capacity secured", booking });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Add stock to a booking
router.put("/add-stock/:bookingId", protect, async (req, res) => {
    try {
        const { quantity, productId, productName } = req.body;
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const newUsed = booking.usedCapacity + parseFloat(quantity);
        if (newUsed > booking.capacityBooked) {
            return res.status(400).json({
                message: `Cannot add ${quantity}kg. Only ${(booking.capacityBooked - booking.usedCapacity).toFixed(1)}kg remaining.`
            });
        }

        booking.usedCapacity = newUsed;
        booking.items.push({
            product: productId || null,
            productName: productName || "Manual Stock",
            quantity: parseFloat(quantity),
            addedAt: new Date()
        });
        await booking.save();

        // Update main storage facility
        const storage = await Storage.findById(booking.storage);
        if (storage) {
            storage.usedCapacity += parseFloat(quantity);
            await storage.save();
        }

        res.json({ message: `${quantity}kg added to storage`, booking });
    } catch (error) {
        console.error("Add stock error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Remove/withdraw stock from booking
router.put("/withdraw/:bookingId", protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (parseFloat(quantity) > booking.usedCapacity) {
            return res.status(400).json({
                message: `Cannot withdraw ${quantity}kg. Only ${booking.usedCapacity}kg in storage.`
            });
        }

        booking.usedCapacity = Math.max(0, booking.usedCapacity - parseFloat(quantity));
        await booking.save();

        // Update main storage facility
        const storage = await Storage.findById(booking.storage);
        if (storage) {
            storage.usedCapacity = Math.max(0, storage.usedCapacity - parseFloat(quantity));
            await storage.save();
        }

        res.json({ message: `${quantity}kg withdrawn from storage`, booking });
    } catch (error) {
        console.error("Withdraw error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Farmer requests capacity extension
router.put("/extend-request/:bookingId", protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.extendRequest = {
            requested: true,
            amount: parseFloat(amount) || 50,
            approved: false
        };
        await booking.save();

        res.json({ message: `Extension request of ${amount || 50}kg submitted`, booking });
    } catch (error) {
        console.error("Extend request error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Storage owner approves extension
router.put("/approve-extension/:bookingId", protect, async (req, res) => {
    try {
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (!booking.extendRequest.requested) {
            return res.status(400).json({ message: "No extension request pending" });
        }

        const extraCapacity = booking.extendRequest.amount;
        booking.capacityBooked += extraCapacity;
        booking.extendRequest = { requested: false, amount: 0, approved: true };
        await booking.save();

        // Also increase main storage capacity if needed
        const storage = await Storage.findById(booking.storage);
        if (storage) {
            storage.capacity += extraCapacity;
            await storage.save();
        }

        res.json({ message: `Extension of ${extraCapacity}kg approved`, booking });
    } catch (error) {
        console.error("Approve extension error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST - Schedule takeout
router.post("/schedule-takeout/:bookingId", protect, async (req, res) => {
    try {
        const { date, vehicleType } = req.body;
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.takeoutSchedule = {
            requested: true,
            date: new Date(date),
            vehicleType: vehicleType,
            status: "PENDING"
        };
        await booking.save();

        res.json({ message: `Takeout scheduled for ${new Date(date).toLocaleDateString()}`, booking });
    } catch (error) {
        console.error("Schedule takeout error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Approve takeout schedule
router.put("/approve-takeout/:bookingId", protect, async (req, res) => {
    try {
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.takeoutSchedule) {
            booking.takeoutSchedule.status = "APPROVED";
            await booking.save();
        }

        res.json({ message: `Takeout approved`, booking });
    } catch (error) {
        console.error("Approve takeout error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Update stock details (keep vs remove) - legacy
router.put("/stock-action/:bookingId", protect, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { keep, remove } = req.body;

        const booking = await StorageBooking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.stockDetails = { keep, remove };
        booking.usedCapacity = parseFloat(keep) || 0;
        await booking.save();

        res.json({ message: "Stock action saved", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET - My bookings (for Farmer Dashboard)
router.get("/my-bookings", protect, async (req, res) => {
    try {
        const bookings = await StorageBooking.find({ farmer: req.user._id })
            .populate("storage")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT - Add specific product to booked storage (Manual Add) - legacy
router.put("/add-product/:bookingId", protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const booking = await StorageBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const product = await AddProduct.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        booking.usedCapacity += parseFloat(quantity);
        booking.items.push({
            product: productId,
            productName: product.variety,
            quantity: parseFloat(quantity),
            addedAt: new Date()
        });
        await booking.save();

        product.storage = booking.storage;
        await product.save();

        const storage = await Storage.findById(booking.storage);
        if (storage) {
            storage.usedCapacity += parseFloat(quantity);
            await storage.save();
        }

        res.json({ message: "Product assigned to storage", booking });
    } catch (error) {
        console.error("Assign error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Storage person extend capacity directly
router.put("/extend-capacity", protect, async (req, res) => {
    try {
        const { extension } = req.body;
        const storage = await Storage.findOne({ owner: req.user._id });
        if (!storage) return res.status(404).json({ message: "Storage not found" });

        storage.capacity += extension;
        await storage.save();

        res.json({ message: "Capacity extended successfully", capacity: storage.capacity });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Remove product from storage - legacy
router.put("/remove-product/:productId", protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await AddProduct.findById(productId);
        if (!product || !product.storage) {
            return res.status(404).json({ message: "Product not in storage" });
        }

        const storage = await Storage.findById(product.storage);
        if (storage) {
            storage.usedCapacity -= product.quantity;
            if (storage.usedCapacity < 0) storage.usedCapacity = 0;
            await storage.save();
        }

        product.storage = null;
        await product.save();

        res.json({ message: "Product removed from storage successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
