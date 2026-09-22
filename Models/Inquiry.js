const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    inquiryType: {
      type: String,
      default: "General Inquiry",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Read", "Replied", "Archived"],
      default: "New",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Inquiry", inquirySchema);
