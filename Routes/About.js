const express = require("express");
const router = express.Router();
const About = require("../Models/About");
const verifyAdmin = require("../Middleware/Auth");

// Default initial payload
const DEFAULT_ABOUT_DATA = {
  name: "Abhishek Kabra",
  tagline: "Author, philosopher, modern spiritual seeker.",
  location: "New Delhi, India",
  footerBio:
    "Writer, essayist, and researcher exploring culture, literature, and technology.",
  portraitUrl:
    "https://res.cloudinary.com/spuetqy8/image/upload/v1789988144/copy_of_34936611-b08f-4a21-ab67-e20b77b0bc53.png",
  bioText: [
    "Abhishek Kabra is an author, essayist, and cultural commentator based in New Delhi. Combining strategic insight with literary exploration, his writing examines how modern technology, memory, and environment shape personal identity.",
    "His essays and articles have been featured across various literary journals, magazines, and independent digital publications.",
  ],
  socials: [
    { platform: "twitter", url: "https://twitter.com", label: "Twitter" },
    { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
    { platform: "instagram", url: "https://instagram.com", label: "Instagram" },
    { platform: "gmail", url: "abhishek@abhishekkabra.com", label: "Gmail" },
  ],
};

// GET /api/about - Public
router.get("/", async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create(DEFAULT_ABOUT_DATA);
    }
    return res.json(about);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch about data", details: err.message });
  }
});

// PUT /api/about - Protected
router.put("/", verifyAdmin, async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Update payload cannot be empty" });
    }

    // Prevent attempt to overwrite immutable DB fields
    const updateData = { ...req.body };
    delete updateData._id;

    // Atomic Update or Create (Upsert)
    const updatedAbout = await About.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true },
    );

    return res.json({
      message: "About data updated successfully",
      about: updatedAbout,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update about data", details: err.message });
  }
});

module.exports = router;
