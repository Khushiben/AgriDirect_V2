const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, "agriSecretKey123");
      console.log("🔐 Token decoded, user ID:", decoded.id);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("❌ User not found in database for ID:", decoded.id);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      
      console.log("✅ User authenticated:", req.user.email, "Role:", req.user.role);
      next();
    } else {
      console.error("❌ No token provided");
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
