// server/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      password,
      state,
      district,
      address,
      licenseId,
    } = req.body;

    // 1️⃣ Check ROLE first
    if (!role) {
      return res.status(400).json({ message: "Please select a role" });
    }

    // 2️⃣ Check NAME
    if (!name) {
      return res.status(400).json({ message: "Full name is required" });
    }

    // 3️⃣ Check EMAIL
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 4️⃣ Check PHONE
    if (!phone) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    // 5️⃣ Check PASSWORD
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 6️⃣ Check if email + role combination already exists
    const existingUser = await User.findOne({ email, role });
    if (existingUser)
      return res.status(400).json({ message: "Account with this email and role already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      name,
      email,
      phone,
      password: hashedPassword,
      state,
      district,
      address,
      licenseId,
      licenseFile: req.file ? req.file.path : null,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful. Await verification.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check EMAIL exists
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
console.log("Login request received for:", email);

    // 2️⃣ Check PASSWORD provided
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 3️⃣ Find user by email (any role)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found for this email" });
    }
console.log("User found:", user.email, "Role:", user.role);

    // 4️⃣ Check PASSWORD matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
console.log("Password matched");

       // 🔐 CREATE TOKEN HERE
    const token = jwt.sign(
      { id: user._id },
      "agriSecretKey123",
      { expiresIn: "7d" }
    );

    // ✅ Login success
    return res.status(200).json({
      success: true,
      role: user.role,
      name: user.name, // ✅ Add name
      email: user.email, // ✅ Add email
      message: "Login successful",
      userId: user._id,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};