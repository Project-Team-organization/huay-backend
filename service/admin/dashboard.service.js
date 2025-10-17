const UserBet = require("../../models/userBetSchema.models");
const LotteryWinner = require("../../models/lottery_winners.model");
const UserTransaction = require("../../models/user.transection.model");
const LotterySets = require("../../models/lotterySets.model");
const moment = require("moment-timezone");

/**
 * 💰 ยอดแทงรวมวันนี้
 * นับจาก UserBet.total_bet_amount ที่แทงวันนี้
 */
exports.getTodayTotalBets = async () => {
  try {
    const startOfDay = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Bangkok").endOf("day").toDate();

    const result = await UserBet.aggregate([
      {
        $match: {
          bet_date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          status: { $ne: "cancelled" }, // ไม่นับที่ยกเลิก
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total_bet_amount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  } catch (error) {
    console.error("Error in getTodayTotalBets:", error);
    throw error;
  }
};

/**
 * 💸 ยอดจ่ายรางวัลวันนี้
 * นับจาก LotteryWinner.payout ที่สร้างวันนี้
 */
exports.getTodayTotalPayouts = async () => {
  try {
    const startOfDay = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Bangkok").endOf("day").toDate();

    const result = await LotteryWinner.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPayout: { $sum: "$payout" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalPayout : 0;
  } catch (error) {
    console.error("Error in getTodayTotalPayouts:", error);
    throw error;
  }
};

/**
 * 💵 กำไรสุทธิ (ระบบ)
 * คำนวณจาก: (เงินฝาก - เงินถอน) จาก UserTransaction
 */
exports.getTodayNetProfit = async () => {
  try {
    const startOfDay = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Bangkok").endOf("day").toDate();

    const result = await UserTransaction.aggregate([
      {
        $match: {
          created_at: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          type: { $in: ["deposit", "withdraw"] },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let deposits = 0;
    let withdrawals = 0;

    result.forEach(item => {
      if (item._id === "deposit") {
        deposits = item.total;
      } else if (item._id === "withdraw") {
        withdrawals = item.total;
      }
    });

    return deposits - withdrawals;
  } catch (error) {
    console.error("Error in getTodayNetProfit:", error);
    throw error;
  }
};

/**
 * 🎯 จำนวนผู้เล่นทั้งหมดวันนี้
 * นับจำนวน user_id ที่ไม่ซ้ำกันใน UserBet วันนี้
 */
exports.getTodayTotalPlayers = async () => {
  try {
    const startOfDay = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Bangkok").endOf("day").toDate();

    const result = await UserBet.aggregate([
      {
        $match: {
          bet_date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$user_id",
        },
      },
      {
        $count: "totalPlayers",
      },
    ]);

    return result.length > 0 ? result[0].totalPlayers : 0;
  } catch (error) {
    console.error("Error in getTodayTotalPlayers:", error);
    throw error;
  }
};

/**
 * 🕐 รอบหวยที่กำลังออกผลวันนี้
 * ดึง LotterySets ที่มี result_time ในวันนี้
 */
exports.getTodayLotteryRounds = async () => {
  try {
    const startOfDay = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Bangkok").endOf("day").toDate();

    const rounds = await LotterySets.find({
      result_time: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("lottery_type_id", "lottery_type")
      .sort({ result_time: 1 })
      .lean();

    return rounds;
  } catch (error) {
    console.error("Error in getTodayLotteryRounds:", error);
    throw error;
  }
};

/**
 * รวมข้อมูล Dashboard ทั้งหมด
 */
exports.getDashboardSummary = async () => {
  try {
    const [totalBets, totalPayouts, netProfit, totalPlayers, lotteryRounds] =
      await Promise.all([
        this.getTodayTotalBets(),
        this.getTodayTotalPayouts(),
        this.getTodayNetProfit(),
        this.getTodayTotalPlayers(),
        this.getTodayLotteryRounds(),
      ]);

    return {
      totalBets,
      totalPayouts,
      netProfit,
      totalPlayers,
      lotteryRounds,
    };
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    throw error;
  }
};
