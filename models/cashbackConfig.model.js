const mongoose = require("mongoose");

const cashbackConfigSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
      max: 100,
    },
    min_loss_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    max_cashback: {
      type: Number,
      default: 0, // 0 = ไม่จำกัด
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_auto_payout: {
      type: Boolean,
      default: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CashbackConfig", cashbackConfigSchema);
