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
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // นับจำนวนทั้งหมด
    const total = await LotteryWinner.countDocuments(filter);

    // แปลงข้อมูลให้อยู่ในรูปแบบตาราง
    const formattedWinners = winners.map(winner => ({
      full_name: winner.user_id.full_name,
      betting_name: winner.betting_name,
      bet_type: winner.betting_type_id, 
      number: winner.matched_numbers[0],
      bet_amount: winner.bet_amount,
      payout: winner.payout,
      reward: winner.reward,
      lottery_set: winner.lottery_set_id.name,
      created_at: winner.createdAt
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

exports.getLotteryWinners = async function(lottery_result_id, page, limit, startDate, endDate) {
  const query = {};
  if (startDate && endDate) {
    query.lottery_result_id = lottery_result_id;
    query.draw_date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (page - 1) * limit;

  const [results, totalCount] = await Promise.all([
    LotteryWinner.find(query)
      .populate('user_id', 'username full_name')
      .populate('lottery_set_id', 'name')
      .skip(skip)
      .limit(parseInt(limit)),
    LotteryWinner.countDocuments(query)
  ]);

  // แปลงข้อมูลให้ตรงตามโครงสร้างที่ต้องการ
  const formattedData = results.map(winner => ({
    betting_name: winner.user_id?.full_name || '',
    bet_type: winner.betting_type_id,
    number: winner.matched_numbers[0],
    bet_amount: winner.bet_amount || 0,
    payout: winner.payout_rate || 0,
    reward: winner.payout,
    lottery_set: winner.lottery_set_id.name,
    created_at: winner.createdAt
  }));

  const total = totalCount || 0;
  const total_pages = Math.ceil(total / limit);

  return {
    data: formattedData,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages
    }
  };
};

exports.getLotteryWinnerById = async function(id) {
  try {
    const winner = await LotteryWinner.findById(id)
      .populate('user_id', 'username full_name')
      .populate('lottery_set_id', 'name');

    if (!winner) {
      throw new Error('ไม่พบข้อมูลผู้ชนะรางวัล');
    }

    // แปลงข้อมูลให้ตรงตามโครงสร้าง
    return {
      betting_name: winner.user_id?.full_name || '',
      bet_type: winner.betting_type_id,
      number: winner.matched_numbers[0],
      bet_amount: winner.bet_amount || 0,
      payout: winner.payout_rate || 0,
      reward: winner.payout,
      lottery_set: winner.lottery_set_id.name,
      created_at: winner.createdAt
    };
  } catch (error) {
    throw error;
  }
}; 