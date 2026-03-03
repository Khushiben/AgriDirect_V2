const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { signup, login } = require("../controllers/authController"); // import login too
const User = require("../models/User");

// SIGNUP
router.post("/signup", upload.single("licenseFile"), signup);

// LOGIN
router.post("/login", login);

// ✅ GET USER BY ID (for dashboard)
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// GET all distributors (public)
router.get("/distributors", async (req, res) => {
  try {
    const distributors = await User.find({ role: "distributor" }).select(
      "name email phone address state district"
    );
    res.json(distributors);
  } catch (error) {
    console.error("Error fetching distributors:", error);
    res.status(500).json({ message: "Error fetching distributors" });
  }
});
module.exports = router;