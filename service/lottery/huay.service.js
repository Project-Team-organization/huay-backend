const huay = require("../../models/huay.model");
const LotterySets = require("../../models/lotterySets.model");
const UserBet = require("../../models/userBetSchema.models");
const LotteryResult = require('../../models/lottery_results.model');
const LotteryResultItem = require('../../models/lottery_result_items.model');
const LotteryWinner = require('../../models/lottery_winners.model');
const { default: mongoose } = require('mongoose');

exports.create = async (data, lottery_set_id) => {
  try {
    const set = await LotterySets.findById(lottery_set_id);
    if (!set) {
      throw new Error("Invalid lottery_set_id : set not found.");
    }

    let result;

    if (Array.isArray(data)) {
      result = await huay.insertMany(data);
    } else {
      result = await huay.create(data);
    }

    return {
      message: "Huay data inserted successfully",
      content: result,
    };
  } catch (error) {
    console.error("Failed to insert Huay data:", error.message);
    throw new Error("Error inserting Huay data: " + error.message);
  }
};

exports.getHuay = async (lottery_set_id) => {
  try {
    if (!lottery_set_id) {
      throw new Error("lottery_set_id is required.");
    }

    const huayData = await huay.find({ lottery_set_id });
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data:", error.message);
    throw new Error("Error retrieving Huay data: " + error.message);
  }
};

exports.getHuayById = async (huayId) => {
  try {
    const huayData = await huay.findById(huayId);
    if (!huayData) {
      throw new Error("Huay data not found.");
    }
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data by ID:", error.message);
    throw new Error("Error retrieving Huay data by ID: " + error.message);
  }
};

exports.updateHuay = async (huayId, data) => {
  try {
    const updatedHuay = await huay.findByIdAndUpdate(huayId, data, {
      new: true,
    });
    return updatedHuay;
  } catch (error) {
    console.error("Failed to update Huay data:", error.message);
    throw new Error("Error updating Huay data: " + error.message);
  }
};

// ประเมินผลการแทงหวยและค้นหาผู้ชนะ
exports.evaluateUserBetsByLotterySet = async function (lottery_set_id, createdBy) {
  try {
    if (!lottery_set_id) {
      throw new Error("ต้องระบุ lottery_set_id");
    }

    // 1. รวบรวมเลขถูกรางวัลทั้งหมดในงวดนี้
    const huayResults = await huay.find({ lottery_set_id });

    if (!huayResults || huayResults.length === 0) {
      throw new Error("ไม่พบผลรางวัลของงวดนี้");
    }

    // 2. สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: 'published',
      createdBy
    });

    console.log(`📌 ตรวจงวด: ${lottery_set_id}`);

    // 3. บันทึกรายการรางวัล
    const resultItems = [];
    for (const result of huayResults) {
      console.log("ข้อมูลผลรางวัล:", result);

      const resultItem = await LotteryResultItem.create({
        lottery_result_id: lotteryResult._id,
        // TODO: รอการปรับปรุงระบบ betting_type_id
        // betting_type_id: result.betting_type_id,
        name: result.huay_name,
        reward: result.reward,
        numbers: result.huay_number,
        winner_count: 0
      });
      resultItems.push(resultItem);
    }

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    console.log(`📦 พบผู้ใช้ที่ยังไม่ตรวจ: ${pendingBets.length} คน`);

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = [];
    for (const userBet of pendingBets) {
      console.log(`👤 ตรวจ user: ${userBet.user_id}`);

      // ตรวจสอบว่าเป็นการแทงของงวดนี้
      if (userBet.lottery_set_id.toString() === lottery_set_id.toString()) {
        for (const bet of userBet.bets) {
          // ตรวจทุกเลขที่แทงกับทุกรายการรางวัล
          for (const resultItem of resultItems) {
            for (const numObj of bet.numbers) {
              const userNumber = numObj.number;
              const amount = numObj.amount;

              const isWin = resultItem.numbers.includes(userNumber);
              console.log(
                `➡️ แทงเลข: ${userNumber}, จำนวน: ${amount} | ${
                  isWin ? "✅ ถูก" : "❌ ไม่ถูก"
                }`
              );

              if (isWin) {
                // สร้างรายการผู้ชนะ
                const winner = await LotteryWinner.create({
                  user_id: userBet.user_id,
                  bet_id: userBet._id,
                  lottery_result_id: lotteryResult._id,
                  // TODO: รอการปรับปรุงระบบ betting_type_id
                  // betting_type_id: bet.betting_type_id,
                  matched_numbers: [userNumber],
                  payout: amount * resultItem.reward,
                  status: 'pending'
                });
                winners.push(winner);

                // อัพเดทจำนวนผู้ชนะ
                resultItem.winner_count += 1;
                await resultItem.save();
              }
            }
          }
        }
      }

      // อัพเดทสถานะการตรวจ
      userBet.status = winners.some(w => w.bet_id.toString() === userBet._id.toString()) 
        ? "won" 
        : "lost";
      userBet.updated_at = new Date();
      await userBet.save();

      console.log(
        `🎯 ผล: ${userBet.status.toUpperCase()}`
      );
    }

    console.log(`\n✅ ตรวจเสร็จทั้งหมด ${pendingBets.length} รายการ`);
    
    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners
    };

  } catch (error) {
    console.error("❌ evaluateUserBetsByLotterySet error:", error.message);
    throw error;
  }
}; 



// ดึงรายการผู้ชนะทั้งหมด
exports.getLotteryWinners = async (lottery_result_id) => {
  return await LotteryWinner.find({ lottery_result_id })
    .populate('user_id', 'username')
    .populate('betting_type_id', 'name')
    .populate('lottery_result_id', 'draw_date');
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async (lottery_result_id) => {
  return await LotteryResultItem.find({ lottery_result_id })
    .populate('betting_type_id', 'name');
};

exports.getAllHuay = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const total = await huay.countDocuments();
    const huays = await huay.find().skip(skip).limit(limit);
    return {
      huays,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to retrieve all Huay data:", error.message);
    throw new Error("Error retrieving all Huay data: " + error.message);
  }
};


