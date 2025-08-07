const mongoose = require('mongoose');

const lotteryLaoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  title: {
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


const LotteryLao = mongoose.model('LotteryLao', lotteryLaoSchema);

module.exports = LotteryLao;
