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
  async getLotteryWinners(lottery_result_id) {
    return await LotteryWinner.find({ lottery_result_id })
      .populate('user_id', 'username')
      .populate('betting_type_id', 'name')
      .populate('lottery_result_id', 'draw_date');
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
          .populate('createdBy', '_id')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        LotteryResult.countDocuments(query)
      ]);

      const total = totalCount || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: results,
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
        LotteryResultItem.find({ lottery_result_id: id })
          .populate('betting_type_id', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LotteryResultItem.countDocuments({ lottery_result_id: id })
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
}

module.exports = new LotteryResultService(); 