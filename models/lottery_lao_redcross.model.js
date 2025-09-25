const mongoose = require("mongoose");

const lotteryLaoRedcrossSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    lotto_date: {
      type: String,
      required: true,
    },
    lottery_name: {
      type: String,
      default: "",
    },
    start_spin: {
      type: Date,
      required: true,
    },
    show_result: {
      type: Date,
      required: true,
    },
    results: {
      digit5: {
        type: String,
        default: "",
      },
      digit4: {
        type: String,
        default: "",
      },
      digit3: {
        type: String,
        default: "",
      },
      digit2_top: {
        type: String,
        default: "",
      },
      digit1: {
        type: String,
        default: "",
      },
      digit2_bottom: {
        type: String,
        default: "",
      },
      digit2_special: {
        type: String,
        default: "",
      },
    },
    betting_types: [
      {
        code: { type: String, default: "" },
        name: { type: String, default: "" },
        digit: { type: String, default: "" },
      },
    ],
    scraper: {
      type: String,
      default: "",
    },
    scrapedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LotteryLaoRedcross = mongoose.model("LotteryLaoRedcross", lotteryLaoRedcrossSchema);

module.exports = LotteryLaoRedcross;
