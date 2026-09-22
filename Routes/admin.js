const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Admin = require("../Models/Admin");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and Password are Required" });
    }

    // 1. Case-insensitive lookup for username
    const normalizedUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({
      username: { $regex: new RegExp(`^${normalizedUsername}$`, "i") },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    // 2. Compare password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    // 3. Ensure JWT secret is explicitly set in production
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && process.env.NODE_ENV === "production") {
      console.error("CRITICAL: JWT_SECRET environment variable is missing!");
      return res
        .status(500)
        .json({ error: "Authentication system misconfigured" });
    }

    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      jwtSecret || "fallback_jwt_secret_key",
      { expiresIn: "8h" },
    );

    return res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server authentication error" });
  }
});

module.exports = router;
