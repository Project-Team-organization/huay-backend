const mongoose = require("mongoose");

const lotteryTypeSchema = new mongoose.Schema(
  {
    lottery_type: { type: String, required: true },
    betting_types: [
      {
        _id: false,
        code: { type: String, required: true },
        name: { type: String, required: true },
        digit: { type: Number, required: true },
        payout_rate: { type: Number, default: null },
        min_bet: { type: Number, default: null },
        max_bet: { type: Number, default: null },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },

  {
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("LotteryType", lotteryTypeSchema);
