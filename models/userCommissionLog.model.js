const mongoose = require("mongoose");

const userCommissionLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ผู้ได้รับค่าคอมมิชชั่น (คนชวน)
    },
    referred_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ผู้ที่เดิมพันหรือฝาก (คนถูกชวน)
    },
    source_type: {
      type: String,
      enum: ["bet_huay", "bet_game", "deposit"],
      required: true,
    },
    ref_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    source_amount: {
      type: Number,
      required: true, // ยอดแทงของเพื่อน
    },
    rate: {
      type: Number,
      required: true, // อัตรา % ณ ตอนนั้น
    },
    commission_amount: {
      type: Number,
      required: true, // เงินคอมมิชชั่นที่ได้รับ
    },
    status: {
      type: String,
      enum: ["credited", "claimed"],
      default: "credited",
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserCommissionLog", userCommissionLogSchema);
