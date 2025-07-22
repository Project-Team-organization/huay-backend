const mongoose = require('mongoose');

const lotteryResultItemSchema = new mongoose.Schema({
  lottery_result_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotteryResult',
    required: true
  },
  betting_type_id: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  numbers: [{
    type: String,
    required: true
  }],
  winner_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LotteryResultItem', lotteryResultItemSchema); 