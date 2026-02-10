const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { signup, login } = require("../controllers/authController"); // import login too

// SIGNUP
router.post("/signup", upload.single("licenseFile"), signup);

// LOGIN
router.post("/login", login);

module.exports = router;