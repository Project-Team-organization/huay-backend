const mongoose = require('mongoose');

const lotteryLaoExtraSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  lotto_date: {
    type: String,
    required: true
  },
  start_spin: {
    type: Date,
    required: true
  },
  show_result: {
    type: Date,
    required: true
  },
  results: {
    number1: {
      type: String,
      required: true
    },
    number2: {
      type: String,
      required: true
    },
    number3: {
      type: String,
      required: true
    },
    number4: {
      type: String,
      required: true
    },
    number5: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

const LotteryLaoExtra = mongoose.model('LotteryLaoExtra', lotteryLaoExtraSchema);

module.exports = LotteryLaoExtra; 