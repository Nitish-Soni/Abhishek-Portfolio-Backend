const express = require("express");
const router = express.Router();
const Subscriber = require("../Models/Subscriber");
const { sendWelcomeEmail } = require("../Utils/sendEmail"); // Imported email utility

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
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

    // Trigger Zoho automated email asynchronously
    sendWelcomeEmail(cleanEmail).catch((err) =>
      console.error("Zoho Email Dispatch Error:", err.message),
    );

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to the dispatch!",
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/newsletter/unsubscribe
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (!subscriber || !subscriber.isActive) {
      return res.status(404).json({
        message: "This email address is not currently subscribed.",
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed.",
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// GET /api/newsletter/subscribers (Admin)
router.get("/subscribers", async (req, res) => {
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

// DELETE /api/newsletter/subscribers/:id (Admin)
router.delete("/subscribers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

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
