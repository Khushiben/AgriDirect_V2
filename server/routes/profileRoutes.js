const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload profile picture (protected)
router.post("/upload-picture", protect, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const profilePicturePath = req.file.filename;

    // Update user's profile picture in database
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: profilePicturePath,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get profile picture (protected)
router.get("/picture", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("profilePicture");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Get profile picture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve profile pictures
router.get("/pictures/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "Profile picture not found" });
  }
});

// Get farmer profile
router.get("/farmer/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "farmer") {
      return res.status(403).json({ success: false, message: "Access denied. Farmer role required." });
    }

    res.json({
      success: true,
      farmer: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        farmSize: user.farmSize,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Get farmer profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update farmer profile
router.put("/farmer/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, phone, farmSize } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "farmer") {
      return res.status(403).json({ success: false, message: "Access denied. Farmer role required." });
    }

    // Update fields
    if (name) user.name = name;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (farmSize) user.farmSize = farmSize;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      farmer: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        farmSize: user.farmSize,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update farmer profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get farmer sold crops
router.get("/farmer/sold-crops", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // This would need to be implemented based on your purchase/transaction model
    // For now, returning empty array
    res.json({
      success: true,
      soldCrops: []
    });
  } catch (error) {
    console.error("Get sold crops error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
