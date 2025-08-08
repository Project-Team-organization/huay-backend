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
    tail4 :{
      type: String,
      default: ''
    },
    tail3: {
      type: String,
      default: ''
    },
    tail2: {
      type: String,
      default: ''
    },
    animal: {
      type: String,
      default: ''
    },
    development:{
      type: Array,
      default: []
    }
  }
}, {
  timestamps: true
});


const LotteryLao = mongoose.model('LotteryLao', lotteryLaoSchema);

module.exports = LotteryLao;
