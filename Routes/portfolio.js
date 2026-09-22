const express = require("express");
const router = express.Router();
const Portfolio = require("../Models/Portfolio");
const verifyAdmin = require("../Middleware/auth");

// GET /api/portfolio - Public
router.get("/", async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio data not found" });
    }
    res.json(portfolio);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch portfolio data", details: err.message });
  }
});

// PUT /api/portfolio - Protected
router.put("/", verifyAdmin, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();
    if (!portfolio) {
      portfolio = new Portfolio(req.body);
    } else {
      Object.assign(portfolio, req.body);
    }
    await portfolio.save();
    res.json({ message: "Portfolio updated successfully", portfolio });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update portfolio data", details: err.message });
  }
});

module.exports = router;
