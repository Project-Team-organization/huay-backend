const mongoose = require("mongoose");

const systemBankSchema = new mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: true,
      trim: true,
    },
    bank_code: {
      type: String,
      required: true,
      trim: true,
    },
    account_name: {
      type: String,
      required: true,
      trim: true,
    },
    account_number: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_updated_by: {
      admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      username: {
        type: String,
        default: "",
      },
      role: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("SystemBank", systemBankSchema);
