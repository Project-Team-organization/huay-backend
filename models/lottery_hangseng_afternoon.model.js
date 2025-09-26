const mongoose = require("mongoose");

const lotteryHangsengAfternoonSchema = new mongoose.Schema(
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
      default: "",
    },
    lottery_name: {
      type: String,
      default: "หวยฮั่งเส็งรอบบ่าย",
    },
    draw_number: {
      type: String,
      default: "",
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
      digit3_top: { type: String, default: "" },
      digit2_top: { type: String, default: "" },
      digit2_bottom: { type: String, default: "" },
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

module.exports = mongoose.model("LotteryHangsengAfternoon", lotteryHangsengAfternoonSchema);
