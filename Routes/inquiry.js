const express = require("express");
const router = express.Router();
const Inquiry = require("../Models/Inquiry");
const InquiryType = require("../Models/InquiryType");
const verifyAdmin = require("../Middleware/auth");

const DEFAULT_INQUIRY_TYPES = [
  "Editorial / Writing Assignment",
  "Literary Agent / Book Rights",
  "Speaking & Panel Engagement",
  "Press & Media Interview",
  "Reader Note / General Inquiry",
];

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */

// GET /api/inquiry/options - Public: Fetch dropdown choices for contact form
router.get("/options", async (req, res) => {
  try {
    const typesFromDb = await InquiryType.find()
      .select("name -_id")
      .sort({ createdAt: 1 });

    const inquiryTypes =
      typesFromDb.length > 0
        ? typesFromDb.map((doc) => doc.name)
        : DEFAULT_INQUIRY_TYPES;

    return res.json({ inquiryTypes });
  } catch (err) {
    console.error("Error fetching inquiry options:", err);
    return res.json({ inquiryTypes: DEFAULT_INQUIRY_TYPES });
  }
});

// GET /api/inquiry/types/public - Public: Alias matching PublicAPI.getInquiryTypes()
router.get("/types/public", async (req, res) => {
  try {
    const types = await InquiryType.find().sort({ createdAt: 1 });
    return res.json(
      types.length > 0
        ? types
        : DEFAULT_INQUIRY_TYPES.map((name) => ({ name })),
    );
  } catch (err) {
    console.error("Error fetching public inquiry types:", err);
    return res.json(DEFAULT_INQUIRY_TYPES.map((name) => ({ name })));
  }
});

// POST /api/inquiry - Public: Submit contact inquiry message
router.post("/", async (req, res) => {
  try {
    const { name, email, inquiryType, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ error: "Please fill in all required fields." });
    }

    const newInquiry = new Inquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      inquiryType: inquiryType ? inquiryType.trim() : "General Inquiry",
      subject: subject.trim(),
      message: message.trim(),
    });

    await newInquiry.save();

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully!",
      inquiry: newInquiry,
    });
  } catch (err) {
    console.error("Error saving inquiry:", err);
    return res.status(500).json({
      error: "Failed to process inquiry. Please try again later.",
      details: err.message,
    });
  }
});

/* ==========================================================================
   PROTECTED ADMIN ROUTES (Requires verifyAdmin Middleware)
   ========================================================================== */

// GET /api/inquiry - Protected: Fetch all received inquiries for admin inbox
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.json(inquiries);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch inquiries", details: err.message });
  }
});

// PATCH /api/inquiry/:id/status - Protected: Update inquiry message status
router.patch("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["New", "Read", "Replied", "Archived"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value provided." });
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedInquiry) {
      return res.status(404).json({ error: "Inquiry message not found." });
    }

    return res.json(updatedInquiry);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to update inquiry status", details: err.message });
  }
});

// DELETE /api/inquiry/:id - Protected: Delete an inquiry message
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deletedInquiry) {
      return res.status(404).json({ error: "Inquiry message not found." });
    }
    return res.json({ message: "Inquiry deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to delete inquiry", details: err.message });
  }
});

// GET /api/inquiry/types - Protected: Fetch raw inquiry types documents for Admin settings
router.get("/types", verifyAdmin, async (req, res) => {
  try {
    const types = await InquiryType.find().sort({ createdAt: 1 });
    return res.json(types);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch inquiry options", details: err.message });
  }
});

// POST /api/inquiry/types - Protected: Add a new inquiry type choice
router.post("/types", verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Option name is required." });
    }

    const newType = new InquiryType({ name: name.trim() });
    await newType.save();

    return res.status(201).json(newType);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "This inquiry type already exists." });
    }
    return res
      .status(500)
      .json({ error: "Failed to add inquiry option", details: err.message });
  }
});

// DELETE /api/inquiry/types/:id - Protected: Delete an inquiry type choice
router.delete("/types/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedType = await InquiryType.findByIdAndDelete(req.params.id);
    if (!deletedType) {
      return res.status(404).json({ error: "Inquiry type option not found." });
    }
    return res.json({ message: "Inquiry option deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to delete inquiry option", details: err.message });
  }
});

module.exports = router;
