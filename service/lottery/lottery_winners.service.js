const LotteryWinner = require('../../models/lottery_winners.model');
const LotterySet = require('../../models/lotterySets.model');
const User = require('../../models/user.model');

exports.getAllWinners = async function(query) {
  try {
    const { page = 1, limit = 10, betting_type_id, lottery_set_id } = query;

    // สร้าง filter object
    const filter = {};
    if (betting_type_id) {
      filter.betting_type_id = betting_type_id;
    }
    if (lottery_set_id) {
      filter.lottery_set_id = lottery_set_id;
    }

    // ดึงข้อมูลผู้ชนะตาม filter และ pagination
    const winners = await LotteryWinner.find(filter)
      .populate('user_id', 'username')
      .populate('lottery_set_id', 'name result_time')
      .sort({ createdAt: -1 }) // เรียงตามเวลาล่าสุด
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // นับจำนวนทั้งหมด
    const total = await LotteryWinner.countDocuments(filter);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
    const formattedWinners = winners.map(winner => ({
      username: winner.user_id.username,
      number: winner.matched_numbers[0],
      payout: winner.payout,
      created_at: winner.createdAt,
      lottery_set: {
        id: winner.lottery_set_id._id,
        name: winner.lottery_set_id.name,
        result_time: winner.lottery_set_id.result_time
      }
    }));

    return {
      data: formattedWinners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('Error getting winners:', error.message);
    throw error;
  }
}; 