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

    const count = await LotterySets.countDocuments({
      name: "หวยยี่กี",
      status: "resulted",
      result_time: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return count;
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
    const [totalBets, totalPayouts, totalPlayers, lotteryRounds] =
      await Promise.all([
        this.getTodayTotalBets(),
        this.getTodayTotalPayouts(),
        this.getTodayTotalPlayers(),
        this.getTodayLotteryRounds(),
      ]);

    const netProfit = totalBets - totalPayouts;

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

/**
 * 📊 รายงานผู้เล่น (Player Report) พร้อม Pagination
 * ดึงข้อมูลจาก users และคำนวณจาก usertransactions
 */
exports.getPlayerReport = async (page = 1, limit = 10) => {
  try {
    const User = require("../../models/user.model");
    const skip = (page - 1) * limit;

    // ดึงข้อมูล users พร้อม pagination
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments();

    // คำนวณข้อมูลแต่ละ user จาก transactions
    const playerReports = await Promise.all(
      users.map(async user => {
        // ยอดฝาก
        const deposits = await UserTransaction.aggregate([
          {
            $match: {
              user_id: user._id,
              type: "deposit",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        // ยอดถอน
        const withdrawals = await UserTransaction.aggregate([
          {
            $match: {
              user_id: user._id,
              type: "withdraw",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        // ยอดแทง
        const bets = await UserBet.aggregate([
          {
            $match: {
              user_id: user._id,
              status: { $ne: "cancelled" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total_bet_amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        // ยอดถูกรางวัล
        const winnings = await LotteryWinner.aggregate([
          {
            $match: {
              user_id: user._id,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$payout" },
              count: { $sum: 1 },
            },
          },
        ]);

        const totalDeposit = deposits.length > 0 ? deposits[0].total : 0;
        const totalWithdraw = withdrawals.length > 0 ? withdrawals[0].total : 0;
        const totalBet = bets.length > 0 ? bets[0].total : 0;
        const betCount = bets.length > 0 ? bets[0].count : 0;
        const totalWinning = winnings.length > 0 ? winnings[0].total : 0;
        const winCount = winnings.length > 0 ? winnings[0].count : 0;

        return {
          userId: user._id,
          username: user.full_name || user.username,
          registeredDate: moment(user.createdAt)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DD"),
          totalDeposit,
          totalWithdraw,
          netBalance: totalDeposit - totalWithdraw,
          betCount,
          winCount,
          commission: 0, // ใส่ 0 ไปก่อนตามที่ขอ
          status: user.active ? "Active" : "Suspended",
        };
      })
    );

    // เรียงตามยอดฝากรวมมากสุด
    playerReports.sort((a, b) => b.totalDeposit - a.totalDeposit);

    return {
      data: playerReports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error("Error in getPlayerReport:", error);
    throw error;
  }
};
