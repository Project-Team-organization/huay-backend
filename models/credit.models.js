// models/credit.model.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CreditSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    master_id: {
      type: Schema.Types.ObjectId,
      ref: "Master",
      default: null,
    },
   
    promotion_id: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      default: null, 
    },
    amount: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    credit_promotion:{
      type: Number,
      default: 0,
    },
    
    // ฟิลด์สำหรับคำนวณค่าคอมมิชชั่น
    commission_percentage: {
      type: Number,
      default: 0,
    },
    commission_amount: {
      type: Number,
      default: 0,
    },
    system_profit: {
      type: Number,
      default: 0,
    },
    
    channel: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    addcredit_admin_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    addcredit_admin_name: {
      type: String,
      required: false,
    },
    addcredit_admin_role:{
      type: String,
      enum: ["admin", "superadmin",""],
    } 
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Credit = mongoose.model("Credit", CreditSchema);

module.exports = Credit;
