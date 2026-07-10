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

    // ดึง 5 ธุรกรรมล่าสุดจริง
    let recentTransactions = [];
    try {
      const UserTransaction = require("../../models/user.transection.model");
      const transactions = await UserTransaction.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate("user_id")
        .lean();

      recentTransactions = transactions.map(t => ({
        id: t._id,
        player: t.user_id ? (t.user_id.full_name || t.user_id.username) : "ไม่ทราบผู้ใช้งาน",
        segment: t.user_id ? (t.user_id.active ? "สมาชิกทั่วไป" : "ระงับการใช้งาน") : "-",
        type: t.type === "deposit" ? "ฝากเงิน" :
              t.type === "withdraw" ? "ถอนเงิน" :
              t.type === "bet" ? "เดิมพัน" :
              t.type === "payout" ? "ถูกรางวัล" :
              t.type === "rebate" ? "คืนค่าคอม" : t.type,
        detail: t.description || "-",
        amount: t.amount,
        status: "สำเร็จ",
        updatedAt: moment(t.created_at).tz("Asia/Bangkok").format("HH:mm น.")
      }));
    } catch (txErr) {
      console.error("Error fetching recent transactions:", txErr.message);
    }

    // ดึง 5 ล็อกกิจกรรมล่าสุดจริง
    let adminLogs = [];
    try {
      const Log = require("../../models/log.model");
      const logs = await Log.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId")
        .lean();

      adminLogs = logs.map(l => ({
        id: l._id,
        action: l.action || "กิจกรรมของแอดมิน/ระบบ",
        detail: l.endpoint ? `${l.method} ${l.endpoint}` : "ไม่ได้ระบุรายละเอียด",
        admin: l.userId ? `โดย: ${l.userId.username}` : "โดย: ระบบอัตโนมัติ",
        timestamp: moment(l.createdAt).tz("Asia/Bangkok").format("DD/MM/YYYY • HH:mm น."),
        reference: `REF#LOG-${String(l._id).slice(-5).toUpperCase()}`,
        kind: l.userId ? "manual" : "system"
      }));
    } catch (logErr) {
      console.error("Error fetching admin logs:", logErr.message);
    }

    // ดึงข้อมูลฝาก-ถอน 12 เดือนย้อนหลังจริง
    let monthlyTransactions = null;
    try {
      monthlyTransactions = await this.getMonthlyTransactions();
    } catch (mtErr) {
      console.error("Error fetching monthly transactions:", mtErr.message);
    }

    // ดึงข้อมูลโบนัส/ค่าคอมมิชชันรายเดือนจริง
    let monthlyBonusCommission = null;
    try {
      monthlyBonusCommission = await this.getMonthlyBonusCommission();
    } catch (mbErr) {
      console.error("Error fetching monthly bonus commission:", mbErr.message);
    }

    // ดึงข้อมูลการมีส่วนร่วม (จำนวนผู้เล่น & ยอดแทง) จริง
    let engagementStats = null;
    try {
      engagementStats = await this.getEngagementStats();
    } catch (engErr) {
      console.error("Error fetching engagement stats:", engErr.message);
    }

    return {
      totalBets,
      totalPayouts,
      netProfit,
      totalPlayers,
      lotteryRounds,
      recentTransactions,
      adminLogs,
      monthlyTransactions,
      monthlyBonusCommission,
      engagementStats
    };
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    throw error;
  }
};

/**
 * 📊 ดึงสถิติการมีส่วนร่วมของผู้เล่น (จำนวนผู้เล่น & ยอดแทง) จริง
 */
exports.getEngagementStats = async () => {
  try {
    const UserBet = require("../../models/userBetSchema.models");
    const moment = require("moment-timezone");

    // 1. รายเดือน (12 เดือนย้อนหลัง)
    const startOfMonthly = moment().tz("Asia/Bangkok").subtract(11, "months").startOf("month").toDate();
    const monthlyResult = await UserBet.aggregate([
      {
        $match: {
          bet_date: { $gte: startOfMonthly },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$bet_date", timezone: "Asia/Bangkok" } },
            month: { $month: { date: "$bet_date", timezone: "Asia/Bangkok" } }
          },
          players: { $addToSet: "$user_id" },
          totalAmount: { $sum: "$total_bet_amount" }
        }
      }
    ]);

    const monthlyCategories = [];
    const monthlyPlayers = [];
    const monthlyBets = [];
    const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    for (let i = 11; i >= 0; i--) {
      const m = moment().tz("Asia/Bangkok").subtract(i, "months");
      const yearVal = m.year();
      const monthVal = m.month() + 1;

      monthlyCategories.push(monthNamesTh[m.month()]);

      const match = monthlyResult.find(r => r._id.year === yearVal && r._id.month === monthVal);
      monthlyPlayers.push(match ? match.players.length : 0);
      monthlyBets.push(match ? Math.round(match.totalAmount) : 0);
    }

    // 2. รายสัปดาห์ (7 วันย้อนหลัง)
    const startOfWeekly = moment().tz("Asia/Bangkok").subtract(6, "days").startOf("day").toDate();
    const weeklyResult = await UserBet.aggregate([
      {
        $match: {
          bet_date: { $gte: startOfWeekly },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$bet_date", timezone: "Asia/Bangkok" } }
          },
          players: { $addToSet: "$user_id" },
          totalAmount: { $sum: "$total_bet_amount" }
        }
      }
    ]);

    const weeklyCategories = [];
    const weeklyPlayers = [];
    const weeklyBets = [];
    const dayNamesTh = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

    for (let i = 6; i >= 0; i--) {
      const d = moment().tz("Asia/Bangkok").subtract(i, "days");
      const dateStr = d.format("YYYY-MM-DD");

      weeklyCategories.push(dayNamesTh[d.day()]);

      const match = weeklyResult.find(r => r._id.date === dateStr);
      weeklyPlayers.push(match ? match.players.length : 0);
      weeklyBets.push(match ? Math.round(match.totalAmount) : 0);
    }

    // 3. รายไตรมาส (4 ไตรมาสของปีนี้)
    const startOfQuarterly = moment().tz("Asia/Bangkok").startOf("year").toDate();
    const quarterlyResult = await UserBet.aggregate([
      {
        $match: {
          bet_date: { $gte: startOfQuarterly },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: {
            quarter: {
              $cond: [
                { $lte: [{ $month: { date: "$bet_date", timezone: "Asia/Bangkok" } }, 3] }, 1,
                {
                  $cond: [
                    { $lte: [{ $month: { date: "$bet_date", timezone: "Asia/Bangkok" } }, 6] }, 2,
                    {
                      $cond: [
                        { $lte: [{ $month: { date: "$bet_date", timezone: "Asia/Bangkok" } }, 9] }, 3, 4
                      ]
                    }
                  ]
                }
              ]
            }
          },
          players: { $addToSet: "$user_id" },
          totalAmount: { $sum: "$total_bet_amount" }
        }
      }
    ]);

    const quarterlyCategories = ["Q1", "Q2", "Q3", "Q4"];
    const quarterlyPlayers = [];
    const quarterlyBets = [];

    for (let q = 1; q <= 4; q++) {
      const match = quarterlyResult.find(r => r._id.quarter === q);
      quarterlyPlayers.push(match ? match.players.length : 0);
      quarterlyBets.push(match ? Math.round(match.totalAmount) : 0);
    }

    return {
      monthly: { categories: monthlyCategories, players: monthlyPlayers, bets: monthlyBets },
      weekly: { categories: weeklyCategories, players: weeklyPlayers, bets: weeklyBets },
      quarterly: { categories: quarterlyCategories, players: quarterlyPlayers, bets: quarterlyBets }
    };
  } catch (error) {
    console.error("Error in getEngagementStats:", error);
    throw error;
  }
};

/**
 * 📊 สถิติฝาก-ถอนย้อนหลัง 12 เดือนจริง
 */
exports.getMonthlyTransactions = async () => {
  try {
    const UserTransaction = require("../../models/user.transection.model");
    const start = moment().tz("Asia/Bangkok").subtract(11, "months").startOf("month").toDate();
    const result = await UserTransaction.aggregate([
      {
        $match: {
          created_at: { $gte: start },
          type: { $in: ["deposit", "withdraw"] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { date: "$created_at", timezone: "Asia/Bangkok" } },
            month: { $month: { date: "$created_at", timezone: "Asia/Bangkok" } },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const categories = [];
    const deposits = [];
    const withdrawals = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 11; i >= 0; i--) {
      const m = moment().tz("Asia/Bangkok").subtract(i, "months");
      const yearVal = m.year();
      const monthVal = m.month() + 1;

      categories.push(monthNames[m.month()]);

      const depMatch = result.find(r => r._id.year === yearVal && r._id.month === monthVal && r._id.type === "deposit");
      const wdMatch = result.find(r => r._id.year === yearVal && r._id.month === monthVal && r._id.type === "withdraw");

      // ใส่เป็นจำนวนเต็มหน่วยบาท หรือหาร 1000 เพื่อลดหน่วยบนกราฟ
      deposits.push(depMatch ? Math.round(depMatch.total) : 0);
      withdrawals.push(wdMatch ? Math.round(wdMatch.total) : 0);
    }

    return { categories, deposits, withdrawals };
  } catch (error) {
    console.error("Error in getMonthlyTransactions:", error);
    throw error;
  }
};

/**
 * 📊 ข้อมูลวิเคราะห์โบนัส/ค่าคอมมิชชันรายเดือนจริง
 */
exports.getMonthlyBonusCommission = async () => {
  try {
    const UserTransaction = require("../../models/user.transection.model");
    const startOfMonth = moment().tz("Asia/Bangkok").startOf("month").toDate();
    const endOfMonth = moment().tz("Asia/Bangkok").endOf("month").toDate();

    const result = await UserTransaction.aggregate([
      {
        $match: {
          created_at: { $gte: startOfMonth, $lte: endOfMonth },
          type: { $in: ["rebate", "refund"] }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let totalPaid = 0;
    result.forEach(r => {
      if (r._id === "rebate" || r._id === "refund") {
        totalPaid += r.total;
      }
    });

    // วันนี้
    const startOfToday = moment().tz("Asia/Bangkok").startOf("day").toDate();
    const endOfToday = moment().tz("Asia/Bangkok").endOf("day").toDate();
    const todayResult = await UserTransaction.aggregate([
      {
        $match: {
          created_at: { $gte: startOfToday, $lte: endOfToday },
          type: { $in: ["rebate", "refund"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    const todayPaid = todayResult.length > 0 ? todayResult[0].total : 0;

    // เป้าหมายจำลอง 1.2M
    const targetGoal = 1200000;
    const percentage = Math.min((totalPaid / targetGoal) * 100, 100);

    return {
      percentage: Number(percentage.toFixed(2)) || 0,
      todayPaid,
      totalPaid,
      targetGoal,
      pendingApproval: 0
    };
  } catch (error) {
    console.error("Error in getMonthlyBonusCommission:", error);
    throw error;
  }
};

/**
 * 📊 รายงานผู้เล่น (Player Report) พร้อม Pagination และ Date Range
 * ดึงข้อมูลจาก users และคำนวณจาก usertransactions
 */
exports.getPlayerReport = async (
  page = 1,
  limit = 10,
  startDate = null,
  endDate = null
) => {
  try {
    const User = require("../../models/user.model");
    const skip = (page - 1) * limit;

    // สร้าง date range filter
    let dateFilter = {};
    if (startDate && endDate) {
      const start = moment(startDate)
        .tz("Asia/Bangkok")
        .startOf("day")
        .toDate();
      const end = moment(endDate).tz("Asia/Bangkok").endOf("day").toDate();
      dateFilter = {
        created_at: {
          $gte: start,
          $lte: end,
        },
      };
    }

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
              ...dateFilter,
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
              ...dateFilter,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        // ยอดแทง (ใช้ bet_date สำหรับ UserBet)
        let betDateFilter = {};
        if (startDate && endDate) {
          const start = moment(startDate)
            .tz("Asia/Bangkok")
            .startOf("day")
            .toDate();
          const end = moment(endDate).tz("Asia/Bangkok").endOf("day").toDate();
          betDateFilter = {
            bet_date: {
              $gte: start,
              $lte: end,
            },
          };
        }

        const bets = await UserBet.aggregate([
          {
            $match: {
              user_id: user._id,
              status: { $ne: "cancelled" },
              ...betDateFilter,
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

        // ยอดถูกรางวัล (ใช้ createdAt สำหรับ LotteryWinner)
        let winDateFilter = {};
        if (startDate && endDate) {
          const start = moment(startDate)
            .tz("Asia/Bangkok")
            .startOf("day")
            .toDate();
          const end = moment(endDate).tz("Asia/Bangkok").endOf("day").toDate();
          winDateFilter = {
            createdAt: {
              $gte: start,
              $lte: end,
            },
          };
        }

        const winnings = await LotteryWinner.aggregate([
          {
            $match: {
              user_id: user._id,
              ...winDateFilter,
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
      players: playerReports,
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
