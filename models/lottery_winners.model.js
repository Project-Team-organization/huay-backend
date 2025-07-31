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
  lottery_set_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotterySets',
    required: true
  },
  betting_type_id: {
    type: String,
    default: null
  },
  betting_name:{
    type: String,
    default:null
  },
  matched_numbers: [{
    type: String,
    required: true
  }],
  bet_amount: {
    type: Number,
    required: true
  },
  payout: {
    type: Number,
    required: true
  },
  reward: {
    type: Number,
    default: 0
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