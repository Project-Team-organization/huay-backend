const mongoose = require("mongoose");

const referralConfigSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      default: 1.0, // เปอร์เซ็นต์คอมมิชชั่นแนะนำเพื่อน (เช่น 1%)
      min: 0,
      max: 100,
    },
    calculation_type: {
      type: String,
      enum: ["turnover", "deposit", "loss"],
      default: "turnover", // แนะนำ: คำนวณจากยอดเล่น/เทิร์นโอเวอร์
    },
    min_claim_amount: {
      type: Number,
      default: 100, // ยอดสะสมขั้นต่ำในการกดรับเครดิต (เช่น 100 บาท)
      min: 0,
    },
    is_active: {
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

module.exports = mongoose.model("ReferralConfig", referralConfigSchema);
