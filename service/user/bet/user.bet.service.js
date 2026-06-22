const UserBet = require("../../../models/userBetSchema.models");
const User = require("../../../models/user.model");
const LotterySet = require("../../../models/lotterySets.model");
const UserTransaction = require("../../../models/user.transection.model");
const BettingType = require("../../../models/bettingTypes.model");
const LotteryLimitedNumbers = require("../../../models/lottery_limited_numbers.model");
const LotteryType = require("../../../models/lotteryType.model");
const mongoose = require("mongoose");

exports.createUserBet = async function (user_id, lottery_set_id, bets) {
  try {
    if (!lottery_set_id || !Array.isArray(bets) || bets.length === 0) {
      throw new Error("lottery_set_id และ bets ต้องไม่ว่าง");
    }

    // ดู set หวย
    const lotterySet = await validateLotterySet(lottery_set_id);
    const lotteryType = await LotteryType.findById(lotterySet.lottery_type_id);
    const bettingTypes = lotteryType?.betting_types || [];
    // ตรวจสอบเลขที่ถูกจำกัด type: full
    const limitedNumbersFull = await LotteryLimitedNumbers.find({
      lottery_set_id: lotterySet._id,
      limit_type: "full",
    });

    // ตรวจสอบเลขที่ถูกจำกัด type: cap
    const limitedNumbersCap = await LotteryLimitedNumbers.find({
      lottery_set_id: lotterySet._id,
      limit_type: "cap",
    });

    // ตรวจสอบแต่ละ bet ว่ามีเลขที่ถูกจำกัดหรือไม่
    for (const bet of bets) {
      // ตรวจสอบ limit_type: full
      const limitedForBetTypeFull = limitedNumbersFull.filter(
        (limit) =>
          limit.betting_type_id.toString() === bet.betting_type_id.toString()
      );

      if (limitedForBetTypeFull.length > 0) {
        for (const number of bet.numbers) {
          const isLimited = limitedForBetTypeFull.some(
            (limit) => limit.number === number.number
          );
          if (isLimited) {
            throw new Error(
              `เลข ${number.number} ถูกจำกัดการแทงสำหรับประเภท ${bet.betting_type_id}`
            );
          }
        }
      }

      // ตรวจสอบ limit_type: cap
      const limitedForBetTypeCap = limitedNumbersCap.filter(
        (limit) =>
          limit.betting_type_id.toString() === bet.betting_type_id.toString()
      );

      if (limitedForBetTypeCap.length > 0) {
        for (const number of bet.numbers) {
          const limitCap = limitedForBetTypeCap.find(
            (limit) => limit.number === number.number
          );
          if (limitCap && number.amount > limitCap.max_total_bet) {
            throw new Error(
              `เลข ${number.number} แทงได้ไม่เกิน ${limitCap.max_total_bet} บาท สำหรับประเภท ${bet.betting_type_id}`
            );
          }
        }
      }
    }

    // คำนวณ bet_amount สำหรับแต่ละ bet
    

    bets.forEach((bet) => {
      console.log("🔍 bettingTypes", bettingTypes);
      console.log("🔍 bet", bet.betting_type_id);
      const foundBettingType = bettingTypes.find(
        (type) => type.code === bet.betting_type_id
      );
      bet.betting_name = foundBettingType?.name || `Unknown Type (${bet.betting_type_id})`;
      bet.bet_amount = bet.numbers.reduce(
        (sum, number) => sum + number.amount,
        0
      );
    });

    const bettingTypeMap = {};
    const user = await User.findById(user_id);
    const balance_before = user.credit;

    const total_bet_amount = bets.reduce((sum, bet) => sum + bet.bet_amount, 0);

    //เช็ค เงินในเครดิต ว่าพอไหม?
    await validateUserCredit(user_id, total_bet_amount);
    //หักเงิน
    await deductUserCredit(user_id, total_bet_amount);

    const userAfter = await User.findById(user_id);
    const balance_after = userAfter.credit;

    const bet = await createUserBetRecord(
      user_id,
      lottery_set_id,
      bets,
      total_bet_amount
    );

    await UserTransaction.create({
      user_id,
      type: "bet",
      amount: total_bet_amount,
      balance_before,
      balance_after,
      ref_id: bet._id,
      ref_model: "UserBet",
      description: "แทงหวย",
      created_at: new Date(),
    });
    return bet;
  } catch (error) {
    console.error("❌ createUserBet error:", error.message);
    throw error;
  }
};

exports.getUserBetsById = async function (user_id, lottery_set_id, status) {
  try {
    if (!user_id) throw new Error("user_id ต้องไม่ว่าง");

    const filter = { user_id };

    if (lottery_set_id) {
      filter.lottery_set_id = lottery_set_id;
    }
    if (status) {
      filter.status = status;
    }
    const bets = await UserBet.find(filter)
      .select("-created_at -updated_at -user_id")
      .populate({
        path: "lottery_set_id",
      })
      .sort({ bet_date: -1 });
    return bets;
  } catch (error) {
    console.error("❌ getUserBetsById error:", error.message);
    throw error;
  }
};

exports.getAllUserBets = async function (page = 1, limit = 10) {
  try {
    console.log("getAllUserBets");
    const skip = (page - 1) * limit;
    const total = await UserBet.countDocuments();
    let bets = await UserBet.find()
      .populate("lottery_set_id")
      .populate("user_id", "full_name")
      .sort({ bet_date: -1 })
      .skip(skip)
      .limit(limit);

    const lotterySetIds = [...new Set(bets.map(bet => bet.lottery_set_id?._id).filter(id => id))];

    const lotterySets = await LotterySet.find({
      _id: { $in: lotterySetIds }
    }).populate("lottery_type_id");

    const lotterySetMap = {};
    lotterySets.forEach(set => {
      lotterySetMap[set._id.toString()] = set;
    });

    bets = bets.map(bet => {
      const betObj = bet.toObject();
      const lotterySet = betObj.lottery_set_id ? lotterySetMap[betObj.lottery_set_id._id.toString()] : null;

      if (lotterySet && lotterySet.lottery_type_id) {
        const lotteryType = lotterySet.lottery_type_id;

        betObj.bets = betObj.bets.map(betDetail => {

          const matchingBettingType = lotteryType.betting_types.find(
            bt => bt.code === betDetail.betting_type_id
          );

          return {
            ...betDetail,
            payout_rate: matchingBettingType ? matchingBettingType.payout_rate : null
          };
        });
      }
      return betObj;
    });

    console.log("bets", bets);
    return {
      bets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ getAllUserBets error:", error.message);
    throw error;
  }
};

async function validateLotterySet(lottery_set_id) {
  const lotterySet = await LotterySet.findById(lottery_set_id);
  if (!lotterySet) throw new Error("ไม่พบชุดหวยชุดนี้");
  if (lotterySet.status == "resulted" || lotterySet.status == "closed") {
    throw new Error("หมดเวลาการแทงหวย");
  }
  if (lotterySet.status == "scheduled") {
    throw new Error("ยังไม่ถึงแทงหวย");
  }
  return lotterySet;
}

//เช็ค เงินในเครดิต ว่าพอไหม?
async function validateUserCredit(user_id, total_bet_amount) {
  const user = await User.findById(user_id);
  if (!user) throw new Error("ไม่พบผู้ใช้งาน");
  if (user.credit < total_bet_amount) {
    throw new Error("เครดิตไม่เพียงพอสำหรับการเดิมพัน");
  }

  return user;
}
// เช็ค เงินในเครดิต ว่าพอไหม?
async function deductUserCredit(user_id, amount) {
  await User.updateOne({ _id: user_id }, { $inc: { credit: -amount } });
}

async function createUserBetRecord(
  user_id,
  lottery_set_id,
  bets,
  total_bet_amount
) {
  const newUserBet = new UserBet({
    user_id,
    lottery_set_id,
    bets,
    total_bet_amount,
    status: "pending",
    created_at: new Date(),
    updated_at: new Date(),
    bet_date: new Date(),
  });

  await newUserBet.save();
  return newUserBet;
}

function validateAndCalculateBets(bets, validTypeIds, bettingTypeMap) {
  try {
    for (const bet of bets) {
      const typeId = String(bet.betting_type_id);
      console.log("🔍 ตรวจสอบ betting_type_id:", typeId);

      if (!validTypeIds.includes(typeId)) {
        throw new Error(`betting_type_id ${typeId} ไม่อยู่ในชุดหวยนี้`);
      }
      const typeConfig = bettingTypeMap[typeId];
      if (!typeConfig) {
        throw new Error(`ไม่พบ config ของ betting_type_id ${typeId}`);
      }
      if (!Array.isArray(bet.numbers) || bet.numbers.length === 0) {
        throw new Error("numbers ใน bet ต้องไม่ว่าง");
      }
      const betAmount = bet.numbers.reduce((sum, n) => {
        console.log("➡️ ตรวจเลข:", n.number, "| amount:", n.amount);

        if (typeof n.amount !== "number" || n.amount <= 0) {
          throw new Error("amount ต้องเป็นตัวเลขมากกว่า 0");
        }
        if (n.amount < typeConfig.min_bet) {
          throw new Error(
            `เลข ${n.number} แทง ${n.amount} น้อยกว่าขั้นต่ำ ${typeConfig.min_bet} ของ betting_type_id ${typeId}`
          );
        }
        if (n.amount > typeConfig.max_bet) {
          throw new Error(
            `เลข ${n.number} แทง ${n.amount} มากกว่าขั้นสูงสุด ${typeConfig.max_bet} ของ betting_type_id ${typeId}`
          );
        }
        return sum + n.amount;
      }, 0);
      bet.bet_amount = betAmount;
      // ลบ bet.payout_amount ออก ไม่ต้องคำนวณ ไม่ต้องใส่ property นี้
    }

    console.log("🎉 validateAndCalculateBets สำเร็จ");
    return bets;
  } catch (error) {
    console.error("❌ validateAndCalculateBets error:", error.message);
    throw error;
  }
}

exports.cancelUserBet = async function (user_id, bet_id) {
  try {
    const userBet = await UserBet.findOne({
      _id: bet_id,
      user_id,
      status: "pending",
    });
    if (!userBet) {
      return null;
    }

    const user = await User.findById(user_id);
    const balance_before = user.credit;

    await User.updateOne(
      { _id: user_id },
      { $inc: { credit: userBet.total_bet_amount } }
    );

    const userAfter = await User.findById(user_id);
    const balance_after = userAfter.credit;

    userBet.status = "cancelled";
    userBet.updated_at = new Date();
    await userBet.save();

    await UserTransaction.create({
      user_id,
      type: "refund",
      amount: userBet.total_bet_amount,
      balance_before,
      balance_after,
      ref_id: userBet._id,
      ref_model: "UserBet",
      description: "ยกเลิกการแทงหวยและคืนเครดิต",
      created_at: new Date(),
    });

    return userBet;
  } catch (error) {
    console.error("❌ cancelUserBet error:", error.message);
    throw error;
  }
};

exports.getUserBetByPk = async function (bet_id) {
  try {
    if (!bet_id) throw new Error("bet_id ต้องไม่ว่าง");
    console.log("🔍 getUserBetByPk bet_id:", bet_id);

    const bet = await UserBet.findById(bet_id)
      .select("-created_at -updated_at -user_id")
      .populate({
        path: "lottery_set_id",
        select: "name lottery_type_id",
        populate: {
          path: "lottery_type_id",
          select: "lottery_type betting_types -_id",
        },
      });

    if (!bet) return null;

    const betObj = bet.toObject();
    const lotterySet = betObj.lottery_set_id;
    
    // แมพข้อมูล betting_types เป็น object เพื่อค้นหาได้ง่าย
    const bettingTypesMap =
      lotterySet?.lottery_type_id?.betting_types?.reduce((acc, type) => {
        acc[type.code] = type;
        return acc;
      }, {}) || {};

    // แมพข้อมูล bets กับ betting_types เพื่อเพิ่ม payout_rate
    const mappedBets = betObj.bets.map((betDetail) => {
      const bettingType = bettingTypesMap[betDetail.betting_type_id] || {};
      return {
        ...betDetail,
        payout_rate: bettingType.payout_rate || null,
        betting_type_name: bettingType.name || null,
      };
    });

    const responseData = {
      _id: betObj._id,
      name: lotterySet.name,
      lottery_type_name: lotterySet?.lottery_type_id?.lottery_type || null,
      bet_date: betObj.bet_date,
      total_bet_amount: betObj.total_bet_amount,
      status: betObj.status,
      bets: mappedBets,
    };
    return responseData;
  } catch (error) {
    console.error("❌ getUserBetByPk error:", error.message);
    throw error;
  }
};
