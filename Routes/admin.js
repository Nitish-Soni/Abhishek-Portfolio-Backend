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

    // 1. Find admin user in database
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    // 2. Compare password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    // 3. Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || "fallback_jwt_secret_key";
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      jwtSecret,
      { expiresIn: "8h" },
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server authentication error" });
  }
});

module.exports = router;
