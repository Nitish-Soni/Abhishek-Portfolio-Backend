const mongoose = require("mongoose");

// Sub-schema for Dynamic Navigation Links
const NavLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  isCta: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

// Sub-schema for Social Links
const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  label: String,
});

// Sub-schema for Highlight Cards
const HighlightSchema = new mongoose.Schema({
  icon: { type: String, default: "pen" },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

// Sub-schema for Outlet Cards
const OutletSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
});

// Sub-schema for Selected Works
const WorkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  publication: { type: String, required: true },
  date: { type: String, required: true },
  readTime: { type: String, required: true },
  excerpt: { type: String, required: true },
  link: { type: String, required: true },
  featured: { type: Boolean, default: false },
});

// Sub-schema for Books & Manuscripts
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  status: {
    type: String,
    enum: ["Published", "Forthcoming"],
    default: "Published",
  },
  publisher: String,
  year: String,
  coverImage: String,
  description: String,
  quote: String,
  quoteAuthor: String,
  links: [{ label: String, url: String }],
});

// Sub-schema for Writing Series
const SeriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  count: String,
  topic: String,
  description: String,
});

// Main Portfolio Schema
const PortfolioSchema = new mongoose.Schema(
  {
    author: {
      name: { type: String, default: "Abhishek Kabra" },
      tagline: { type: String, default: "Writer & Author" },
      logoText: { type: String, default: "Abhishek Kabra" },
      logoUrl: { type: String, default: "" },
      footerBio: {
        type: String,
        default:
          "Writer and author exploring culture, human behavior, and the spaces in between. Published in various literary journals and independent presses.",
      },
      heroTitle: String,
      heroSubtitle: String,
      bioHeadline: String,
      bioText: [String],
      location: String,
      portraitUrl: String,
      agentName: { type: String, default: "Eleanor Vance" },
      agentAgency: { type: String, default: "Apex Literary Agency" },
      agentEmail: { type: String, default: "agent@apexliterary.com" },
      contactEmail: { type: String, default: "abhishek@abhishekkabra.com" },
      socials: [SocialLinkSchema],
      highlights: [HighlightSchema],
      outlets: [OutletSchema],
    },
    navigation: [NavLinkSchema],
    inquiryTypes: [String], // Dynamic nature of inquiry dropdown options
    press: [String],
    works: [WorkSchema],
    books: [BookSchema],
    series: [SeriesSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
