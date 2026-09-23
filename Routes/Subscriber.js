const express = require("express");
const router = express.Router();
const Subscriber = require("../Models/Subscriber");
const {
  sendWelcomeEmail,
  sendUnsubscribeEmail,
} = require("../Utils/SendEmail");
const verifyAdmin = require("../Middleware/Auth");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */

// POST /api/newsletter/subscribe - Public
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
    }

    const existingSubscriber = await Subscriber.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        // Asynchronous welcome back email
        sendWelcomeEmail(cleanEmail).catch((err) =>
          console.error("Failed to send welcome back email:", err.message),
        );

        return res.status(200).json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to the newsletter!",
      });
    }

    // Save new subscriber record
    const newSubscriber = new Subscriber({ email: cleanEmail });
    await newSubscriber.save();

    // Trigger automated email asynchronously
    sendWelcomeEmail(cleanEmail).catch((err) =>
      console.error("Email Dispatch Error:", err.message),
    );

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to the dispatch!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "You are already subscribed to the newsletter!",
      });
    }
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/newsletter/unsubscribe - Public
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find and delete or set active: false
    const subscriber = await Subscriber.findOneAndDelete({
      email: trimmedEmail,
    });

    if (!subscriber) {
      return res
        .status(404)
        .json({ message: "Email not found or already unsubscribed." });
    }

    // Optional: Trigger confirmation email
    try {
      await sendUnsubscribeEmail(trimmedEmail);
    } catch (err) {
      console.warn(
        "Could not send unsubscribe confirmation email:",
        err.message,
      );
    }

    return res.json({
      success: true,
      message: "You have been successfully unsubscribed.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res
      .status(500)
      .json({ error: "Failed to process unsubscribe request." });
  }
});

/* ==========================================================================
   PROTECTED ADMIN ROUTES (Requires verifyAdmin Middleware)
   ========================================================================== */

// GET /api/newsletter/subscribers - Protected Admin
router.get("/subscribers", verifyAdmin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    return res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch subscribers list." });
  }
});

// DELETE /api/newsletter/subscribers/:id - Protected Admin (Removes or Unsubscribes by Admin)
router.delete("/subscribers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    // Trigger unsubscribe/removal notification email asynchronously
    sendUnsubscribeEmail(deletedSubscriber.email).catch((err) =>
      console.error("Failed to send admin removal email:", err.message),
    );

    return res.status(200).json({
      success: true,
      message: "Subscriber permanently removed.",
    });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return res.status(500).json({ message: "Failed to delete subscriber." });
  }
});

module.exports = router;
