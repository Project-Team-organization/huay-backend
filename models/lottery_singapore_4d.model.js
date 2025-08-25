const mongoose = require("mongoose");

const lotterySingapore4dSchema = new mongoose.Schema(
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
      starter_prizes: {
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
        digit: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LotterySingapore4d = mongoose.model("LotterySingapore4d", lotterySingapore4dSchema);

module.exports = LotterySingapore4d;
