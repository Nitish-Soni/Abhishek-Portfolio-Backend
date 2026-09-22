const mongoose = require("mongoose");

const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  label: { type: String, required: true },
});

const AboutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Abhishek Kabra",
    },
    tagline: {
      type: String,
      default: "Author, philosopher, modern spiritual seeker.",
    },
    footerBio: {
      type: String,
      default:
        "Writer, essayist, and researcher exploring culture, literature, and technology.",
    },
    location: {
      type: String,
      default: "New Delhi, India",
    },
    portraitUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/spuetqy8/image/upload/v1789988144/copy_of_34936611-b08f-4a21-ab67-e20b77b0bc53.png",
    },
    bioText: {
      type: [String],
      default: [
        "Abhishek Kabra is an author, essayist, and cultural commentator based in New Delhi. Combining strategic insight with literary exploration, his writing examines how modern technology, memory, and environment shape personal identity.",
        "His essays and articles have been featured across various literary journals, magazines, and independent digital publications.",
      ],
    },
    socials: {
      type: [SocialLinkSchema],
      default: [
        { platform: "twitter", url: "https://twitter.com", label: "Twitter" },
        {
          platform: "linkedin",
          url: "https://linkedin.com",
          label: "LinkedIn",
        },
        {
          platform: "instagram",
          url: "https://instagram.com",
          label: "Instagram",
        },
        {
          platform: "gmail",
          url: "abhishek@abhishekkabra.com",
          label: "Gmail",
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("About", AboutSchema, "abouts");
