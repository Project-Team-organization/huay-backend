const LotteryResult = require('../../models/lottery_results.model');
const LotteryResultItem = require('../../models/lottery_result_items.model');
const LotteryWinner = require('../../models/lottery_winners.model');
const UserBet = require('../../models/userBetSchema.models');
const { default: mongoose } = require('mongoose');

class LotteryResultService {
  // ประกาศผลหวยและค้นหาผู้ชนะ
  async evaluateLotteryResults(lottery_set_id, results, createdBy) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // สร้างผลหวยและประกาศทันที
      const lotteryResult = await LotteryResult.create([{
        lottery_set_id,
        draw_date: new Date(), // ใช้วันที่ปัจจุบัน
        status: 'published',
        createdBy
      }], { session });

      // แปลงข้อมูลผลรางวัลให้อยู่ในรูปแบบที่ต้องการ
      const resultItems = [];
      for (const item of results) {
        const resultItem = await LotteryResultItem.create([{
          lottery_result_id: lotteryResult[0]._id,
          betting_type_id: this.getBettingTypeFromName(item.huay_name), // ต้องมีฟังก์ชันแปลงชื่อรางวัลเป็น betting_type_id
          name: item.huay_name,
          reward: item.reward,
          numbers: item.huay_number
        }], { session });
        resultItems.push(resultItem[0]);

        // ค้นหาผู้ชนะสำหรับรางวัลนี้
        const winningBets = await UserBet.find({
          lottery_set_id: lottery_set_id,
          betting_type_id: this.getBettingTypeFromName(item.huay_name),
          numbers: { $in: item.huay_number }
        }).session(session);

        // สร้างรายการผู้ชนะ
        const winners = await Promise.all(winningBets.map(async (bet) => {
          const matchedNumbers = bet.numbers.filter(num => 
            item.huay_number.includes(num)
          );

          const payout = item.reward * bet.amount;

          return await LotteryWinner.create([{
            user_id: bet.user_id,
            bet_id: bet._id,
            lottery_result_id: lotteryResult[0]._id,
            betting_type_id: this.getBettingTypeFromName(item.huay_name),
            matched_numbers: matchedNumbers,
            payout: payout
          }], { session });
        }));

        // อัพเดทจำนวนผู้ชนะ
        await LotteryResultItem.findByIdAndUpdate(
          resultItem[0]._id,
          { winner_count: winners.length },
          { session }
        );
      }

      await session.commitTransaction();
      
      return {
        lottery_result: lotteryResult[0],
        result_items: resultItems
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ฟังก์ชันช่วยแปลงชื่อรางวัลเป็น betting_type_id
  getBettingTypeFromName(huayName) {
    // TODO: ต้องมีการ map ระหว่างชื่อรางวัลกับ betting_type_id
    // ตัวอย่าง:
    const typeMap = {
      'รางวัลที่ 1': 'first_prize_type_id',
      'รางวัลเลขหน้า 3 ตัว': 'front_three_type_id',
      'รางวัลเลขท้าย 3 ตัว': 'last_three_type_id',
      'รางวัลเลขท้าย 2 ตัว': 'last_two_type_id'
    };
    return typeMap[huayName];
  }

  // ดึงรายการผู้ชนะทั้งหมด
  async getLotteryWinners(lottery_result_id, page, limit, startDate, endDate) {
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
  }


  // ดึงรายการผลรางวัลทั้งหมดของงวด
  async getLotteryResultItems(lottery_result_id) {
    return await LotteryResultItem.find({ lottery_result_id })
      .populate('betting_type_id', 'name');
  }

  // 1. ดึงข้อมูลทั้งหมดแบบ pagination
  async getAllLotteryResults({ page = 1, limit = 10, startDate, endDate }) {
    try {
      const query = {};
      
      if (startDate && endDate) {
        query.draw_date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Add pagination
      const skip = (page - 1) * limit;

      const [results, totalCount] = await Promise.all([
        LotteryResult.find(query)
          .populate({
            path: 'lottery_set_id',
            populate: {
              path: 'lottery_type_id',
              select: 'name'
            }
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        LotteryResult.countDocuments(query)
      ]);

      const total = totalCount || 0;
      const totalPages = Math.ceil(total / limit);

      // ดึงข้อมูลเลขรางวัลจาก lottery result items
      const resultPromises = results.map(async (result) => {
        const resultItems = await LotteryResultItem.find({
          lottery_result_id: result._id,
          betting_type_id: '6d_top'
        }).select('numbers');

        // แปลงสถานะให้เป็นข้อความที่ต้องการ
        const displayStatus = result.lottery_set_id.status === 'resulted' ? 'ออกรางวัลแล้ว' : 'ยังไม่ประกาศ';

        return {
          date: result.draw_date,
          lottery_name: result.lottery_set_id.name,
          lottery_type: result.lottery_set_id.lottery_type_id.lottery_type,
          number: resultItems.length > 0 ? resultItems[0].numbers[0] : '',
          status: displayStatus,
          winner_count: 0
        };
      });

      const formattedResults = await Promise.all(resultPromises);

      return {
        data: formattedResults,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 2. ดึงข้อมูลตาม id แบบ pagination
  async getLotteryResultById(id, { page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        LotteryResult.find({ _id: id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LotteryResult.countDocuments({ _id: id })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: items,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 3. ดึงข้อมูลตาม lottery_result_id แบบ pagination
  async getLotteryResultsByResultId(lottery_result_id, { page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        LotteryResultItem.find({ lottery_result_id })
          .populate('betting_type_id', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LotteryResultItem.countDocuments({ lottery_result_id })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: items,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 4. ดึงข้อมูลตาม betting_type_id แบบ pagination
  async getLotteryResultsByBettingType(betting_type_id, { page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        LotteryResultItem.find({ betting_type_id })
          .populate('lottery_result_id')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LotteryResultItem.countDocuments({ betting_type_id })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: items,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 5. ลบข้อมูลตาม lottery_result_id
  async deleteLotteryResultAndItems(lottery_result_id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ลบ lottery result items
      await LotteryResultItem.deleteMany({ lottery_result_id }, { session });
      
      // ลบ lottery result
      await LotteryResult.findByIdAndDelete(lottery_result_id, { session });

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ค้นหาผู้ชนะตาม lottery set และ user_id
  async getWinnersByLotterySetAndUser(lottery_set_id, user_id, { page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      // หา lottery_result_id จาก lottery_set_id
      const lotteryResults = await LotteryResult.find({ lottery_set_id });
      const lotteryResultIds = lotteryResults.map(result => result._id);

      const query = {
        lottery_result_id: { $in: lotteryResultIds },
        user_id: user_id
      };

      const [winners, total] = await Promise.all([
        LotteryWinner.find(query)
          .populate('user_id', 'username')
          .populate('betting_type_id', 'name')
          .populate('lottery_result_id', 'draw_date')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        LotteryWinner.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: winners,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ดึงรายการผู้ชนะตาม ID
  async getLotteryWinnerById(id) {
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
  }
}

module.exports = new LotteryResultService(); 