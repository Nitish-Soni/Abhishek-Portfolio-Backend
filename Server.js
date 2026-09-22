const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://2nison6.com",
      "https://www.2nison6.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Import Routes
const adminRoutes = require("./Routes/admin");
const aboutRoutes = require("./Routes/about");
const portfolioRoutes = require("./Routes/portfolio");
const inquiryRoutes = require("./Routes/inquiry");
const subscriberRoutes = require("./Routes/subscriber"); // Added Subscriber routes

// Mount Routes
app.use("/api/admin", adminRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/newsletter", subscriberRoutes); // Mounted Newsletter/Subscriber endpoints

// Database Connection & Server Initialization
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
