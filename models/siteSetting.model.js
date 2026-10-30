const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "site",
    },
    site_name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    site_description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    contact_url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    line_url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    telegram_url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("SiteSetting", siteSettingSchema);
