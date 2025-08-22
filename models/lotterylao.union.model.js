const mongoose = require('mongoose');

const lotteryLaoUnionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "lao-lottery"
    },
    url: {
      type: String,
      default: "https://public-api.laounion.com/result"
    },
    lotto_date: {
      type: String,
      required: true
    },
    start_spin: {
      type: Date,
      required: true
    },
    show_result: {
      type: Date,
      required: true
    },
    lottery_name: {
      type: String,
      default: "หวยลาวสามัคคี"
    },
    results: {
      digit5: {
        type: String,
        default: null
      },
      digit4: {
        type: String,
        default: null
      },
      digit3: {
        type: String,
        default: null
      },
      digit2_top: {
        type: String,
        default: null
      },
      digit2_bottom: {
        type: String,
        default: null
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

const LotteryLaoUnion = mongoose.model('LotteryLaoUnion', lotteryLaoUnionSchema);

module.exports = LotteryLaoUnion; 