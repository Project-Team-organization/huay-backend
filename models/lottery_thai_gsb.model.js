const mongoose = require("mongoose");

const lotteryThaiGsbSchema = new mongoose.Schema(
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
    start_spin: {
      type: Date,
      required: true,
    },
    show_result: {
      type: Date,
      required: true,
    },
    results: {
      digit7: {
        type: String,
        default: "",
      },
      digit6: {
        type: String,
        default: "",
      },
      digit5: {
        type: String,
        default: "",
      },
      digit4: {
        type: String,
        default: "",
      },
      digit3_top: {
        type: String,
        default: "",
      },
      digit2_top: {
        type: String,
        default: "",
      },
      digit2_bottom: {
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
  },
  {
    timestamps: true,
  }
);

const LotteryThaiGsb = mongoose.model("LotteryThaiGsb", lotteryThaiGsbSchema);

module.exports = LotteryThaiGsb;
