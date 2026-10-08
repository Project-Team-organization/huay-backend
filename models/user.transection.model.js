const mongoose = require("mongoose");

const userTransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["bet", "payout", "deposit", "withdraw", "rebate", "refund"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balance_before: {
    type: Number,
    required: true,
  },
  balance_after: {
    type: Number,
    required: true,
  },
  ref_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: 'ref_model'
  },
  ref_model: {
    type: String,
    required: false,
    enum: ['UserBet', 'Credit', 'Withdrawal']
  },
  category: {
    type: String,
    enum: ["lottery", "game", "transaction"],
    default: "transaction",
  },
  provider_name: {
    type: String,
    default: "",
  },
  game_name: {
    type: String,
    default: "",
  },
  bet_id: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
  payout_amount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserTransaction", userTransactionSchema);
