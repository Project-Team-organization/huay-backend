const mongoose = require("mongoose");

const systemBankLogSchema = new mongoose.Schema(
  {
    system_bank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemBank",
      default: null,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    admin_username: {
      type: String,
      default: "Admin",
    },
    admin_role: {
      type: String,
      default: "admin",
    },
    action: {
      type: String,
      enum: ["create", "update"],
      default: "update",
    },
    previous_data: {
      bank_name: { type: String, default: "" },
      bank_code: { type: String, default: "" },
      account_name: { type: String, default: "" },
      account_number: { type: String, default: "" },
      is_active: { type: Boolean, default: true },
    },
    new_data: {
      bank_name: { type: String, default: "" },
      bank_code: { type: String, default: "" },
      account_name: { type: String, default: "" },
      account_number: { type: String, default: "" },
      is_active: { type: Boolean, default: true },
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip_address: {
      type: String,
      default: "",
    },
    user_agent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

systemBankLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SystemBankLog", systemBankLogSchema);
