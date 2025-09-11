const mongoose = require("mongoose");

const lotteryHanoiSpecialApiSchema = new mongoose.Schema(
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
      default: "ฮานอยพิเศษ",
    },
    lotto_date: {
      type: String,
      default: "",
    },
    lottery_name: {
      type: String,
      default: "ฮานอยพิเศษ",
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
      prize_1st: { type: String, default: "" },
      prize_2nd: { type: String, default: "" },
      prize_3rd_1: { type: String, default: "" },
      prize_3rd_2: { type: String, default: "" },
      prize_4th_1: { type: String, default: "" },
      prize_4th_2: { type: String, default: "" },
      prize_4th_3: { type: String, default: "" },
      prize_4th_4: { type: String, default: "" },
      prize_4th_5: { type: String, default: "" },
      prize_4th_6: { type: String, default: "" },
      prize_5th_1: { type: String, default: "" },
      prize_5th_2: { type: String, default: "" },
      prize_5th_3: { type: String, default: "" },
      prize_5th_4: { type: String, default: "" },
      prize_6th_1: { type: String, default: "" },
      prize_6th_2: { type: String, default: "" },
      prize_6th_3: { type: String, default: "" },
      prize_6th_4: { type: String, default: "" },
      prize_6th_5: { type: String, default: "" },
      prize_6th_6: { type: String, default: "" },
      prize_7th_1: { type: String, default: "" },
      prize_7th_2: { type: String, default: "" },
      prize_7th_3: { type: String, default: "" },
      prize_2digits_1: { type: String, default: "" },
      prize_2digits_2: { type: String, default: "" },
      prize_2digits_3: { type: String, default: "" },
      prize_2digits_4: { type: String, default: "" },
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

module.exports = mongoose.model("LotteryHanoiSpecialApi", lotteryHanoiSpecialApiSchema);
