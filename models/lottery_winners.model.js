const mongoose = require('mongoose');

const lotteryWinnerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserBet'
  },
  lottery_result_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotteryResult',
    required: true
  },
  betting_type_id: {
    type: String,
    default: null
  },
  matched_numbers: [{
    type: String,
    required: true
  }],
  payout: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LotteryWinner', lotteryWinnerSchema); 