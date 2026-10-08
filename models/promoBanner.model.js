const mongoose = require("mongoose");

const promoBannerSchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true },
    file_name: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    is_active: { type: Boolean, default: true },
    link_url: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PromoBanner ||
  mongoose.model("PromoBanner", promoBannerSchema);
