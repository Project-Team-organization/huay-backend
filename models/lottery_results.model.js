const mongoose = require('mongoose');

const lotteryResultSchema = new mongoose.Schema({
  lottery_set_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LotterySets',
    required: true
  },
  draw_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LotteryResult', lotteryResultSchema); 