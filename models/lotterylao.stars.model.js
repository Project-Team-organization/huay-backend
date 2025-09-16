const mongoose = require("mongoose");

const lotteryLaoStarsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ['normal', 'vip'],
      default: 'normal',
      required: true,
    },
    lotto_date: {
      type: String,
      required: true,
    },
    start_spin: {
      type: Date,
      required: true,
    },
    show_result: {
      type: Date,
      required: true,
    },
    lottery_name: {
      type: String,
      default: "",
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

// เพิ่ม unique index เพื่อป้องกันข้อมูลซ้ำ (รวม type)
lotteryLaoStarsSchema.index({ lotto_date: 1, type: 1 }, { unique: true });

const LotteryLaoStars = mongoose.model(
  "LotteryLaoStars",
  lotteryLaoStarsSchema
);

module.exports = LotteryLaoStars;
