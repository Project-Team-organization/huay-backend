const mongoose = require('mongoose');

const lotteryLimitedNumbersSchema = new mongoose.Schema({
    lottery_set_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LotterySets',
        required: true
    },
    betting_type_id: {
       type: String,
       default: null
    },
    number: {
        type: String,
        required: true
    },
    limit_type: {
        type: String,
        enum: ['full', 'partial', 'cap'],
        required: true
    },
    payout_rate: {
        type: Number,
        required: function() {
            return this.limit_type === 'partial';
        }
    },
    max_total_bet: {
        type: Number,
        required: function() {
            return this.limit_type === 'cap';
        }
    },
    note: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// อัพเดท updated_at เมื่อมีการแก้ไขข้อมูล
lotteryLimitedNumbersSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const LotteryLimitedNumbers = mongoose.model('LotteryLimitedNumbers', lotteryLimitedNumbersSchema);

module.exports = LotteryLimitedNumbers; 