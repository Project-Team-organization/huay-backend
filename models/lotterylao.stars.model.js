const mongoose = require('mongoose');

const lotteryLaoStarsSchema = new mongoose.Schema({
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
    digit5: {
      type: String,
      default: ''
    },
    digit4: {
      type: String,
      default: ''
    },
    digit3: {
      type: String,
      default: ''
    },
    digit2_top: {
      type: String,
      default: ''
    },
    digit2_bottom: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

const LotteryLaoStars = mongoose.model('LotteryLaoStars', lotteryLaoStarsSchema);

module.exports = LotteryLaoStars; 