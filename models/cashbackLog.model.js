const mongoose = require("mongoose");

const cashbackLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    total_bet: {
      type: Number,
      default: 0,
    },
    total_payout: {
      type: Number,
      default: 0,
    },
    lottery_bet: {
      type: Number,
      default: 0,
    },
    lottery_payout: {
      type: Number,
      default: 0,
    },
    game_bet: {
      type: Number,
      default: 0,
    },
    game_payout: {
      type: Number,
      default: 0,
    },
    net_loss: {
      type: Number,
      default: 0,
    },
    cashback_rate: {
      type: Number,
      default: 0,
    },
    cashback_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "failed", "pending"],
      default: "completed",
    },
    remark: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

cashbackLogSchema.index({ user_id: 1, start_date: 1 }, { unique: true });

module.exports = mongoose.model("CashbackLog", cashbackLogSchema);
