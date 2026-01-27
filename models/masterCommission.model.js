const mongoose = require("mongoose");
const { Schema } = mongoose;

const MasterCommissionSchema = new Schema(
  {
    master_id: {
      type: Schema.Types.ObjectId,
      ref: "Master",
      required: true,
    },
    
    // ระบุเดือน-ปี (ใช้เป็น unique key)
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    period_start: {
      type: Date,
      required: true,
    },
    period_end: {
      type: Date,
      required: true,
    },
    
    // สรุปยอดฝาก (Running Total)
    total_deposit_amount: {
      type: Number,
      default: 0,
    },
    total_deposit_count: {
      type: Number,
      default: 0,
    },
    total_deposit_commission: {
      type: Number,
      default: 0,
    },
    total_deposit_system_profit: {
      type: Number,
      default: 0,
    },
    
    // สรุปยอดถอน (Running Total)
    total_withdrawal_amount: {
      type: Number,
      default: 0,
    },
    total_withdrawal_count: {
      type: Number,
      default: 0,
    },
    total_withdrawal_commission: {
      type: Number,
      default: 0,
    },
    total_withdrawal_system_loss: {
      type: Number,
      default: 0,
    },
    
    // สรุปสุทธิ
    net_amount: {
      type: Number,
      default: 0,
    },
    net_commission: {
      type: Number,
      default: 0,
    },
    net_system_profit: {
      type: Number,
      default: 0,
    },
    
    // ข้อมูลเพิ่มเติม
    commission_percentage: {
      type: Number,
      default: 0,
    },
    user_count: {
      type: Number,
      default: 0,
    },
    
    // สถานะการจ่ายเงิน
    status: {
      type: String,
      enum: ["active", "closed", "paid"],
      default: "active",
    },
    paid_at: {
      type: Date,
      default: null,
    },
    paid_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    
    notes: {
      type: String,
      default: "",
    },
    
    last_updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// สร้าง Unique Index (1 Master = 1 Record ต่อเดือน)
MasterCommissionSchema.index({ master_id: 1, year: 1, month: 1 }, { unique: true });

const MasterCommission = mongoose.model("MasterCommission", MasterCommissionSchema);

module.exports = MasterCommission;
