const mongoose = require("mongoose");

const lotteryMagnum4dSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    title: {
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
    draw_number: {
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
      first_prize: {
        type: String,
        default: "",
      },
      second_prize: {
        type: String,
        default: "",
      },
      third_prize: {
        type: String,
        default: "",
      },
      special_prizes: {
        type: [String],
        default: [],
      },
      consolation_prizes: {
        type: [String],
        default: [],
      },
    },
    betting_types: [
      {
        code: { type: String, default: "" },
        name: { type: String, default: "" },
        digit: { type: [String], default: [] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LotteryMagnum4d = mongoose.model("LotteryMagnum4d", lotteryMagnum4dSchema);

module.exports = LotteryMagnum4d;
