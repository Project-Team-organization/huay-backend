const mongoose = require("mongoose");

const lotteryGrandDragon4dSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lotto_date: {
      type: String,
      required: true,
    },
    draw_number: {
      type: String,
      default: null,
    },
    lottery_name: {
      type: String,
      required: true,
    },
    scraper: {
      type: String,
      default: "grand-dragon-4d",
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    start_spin: {
      type: Date,
      default: Date.now,
    },
    show_result: {
      type: Date,
      default: Date.now,
    },
    results: {
      first_prize: {
        type: String,
        required: true,
      },
      second_prize: {
        type: String,
        required: true,
      },
      third_prize: {
        type: String,
        required: true,
      },
      special_prizes: [{
        type: String,
        required: true,
      }],
      consolation_prizes: [{
        type: String,
        required: true,
      }],
    },
    betting_types: [
      {
        code: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        digit: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LotteryGrandDragon4d", lotteryGrandDragon4dSchema);
