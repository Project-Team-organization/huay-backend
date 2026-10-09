const mongoose = require("mongoose");

const userCommissionClaimSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // จำนวนเงินที่กดรับ
    },
    balance_before: {
      type: Number,
      required: true, // เครดิตหลักก่อนกดรับ
    },
    balance_after: {
      type: Number,
      required: true, // เครดิตหลักหลังกดรับ
    },
    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserCommissionClaim", userCommissionClaimSchema);
