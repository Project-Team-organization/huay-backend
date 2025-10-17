const UserBet = require("../../models/userBetSchema.models");
const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const User = require("../../models/user.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// ดึงสถิติหวยแต่ละงวด (รายละเอียดเต็ม)
exports.getLotteryStats = async ({ lotterySetId }) => {
  try {
    if (!lotterySetId) {
      return handleError(null, "กรุณาระบุ lottery_set_id", 400);
    }

    // ดึงข้อมูล lottery set
    const lotterySet = await LotterySets.findById(lotterySetId).populate("lottery_type_id");
    
    if (!lotterySet) {
      return handleError(null, "ไม่พบงวดหวยที่ระบุ", 404);
    }

    // ดึงข้อมูลการแทงทั้งหมดของงวดนี้
    const bets = await UserBet.find({
      lottery_set_id: lotterySetId,
      status: { $ne: "cancelled" }
    }).populate("user_id", "username full_name");

    if (bets.length === 0) {
      return handleSuccess(
        {
          lotteryName: lotterySet.lottery_type_id?.lottery_type || "ไม่ระบุ",
          lotterySetName: lotterySet.name,
          drawDate: lotterySet.result_time,
          openDate: lotterySet.openTime,
          closeTime: lotterySet.closeTime,
          totalPlayers: 0,
          totalBetAmount: 0,
          totalPayoutAmount: 0,
          totalProfit: 0,
          topBetUser: null,
          topWinUser: null,
          popularNumbers: [],
          prizeResults: []
        },
        "ไม่มีข้อมูลการแทงในงวดนี้",
        200
      );
    }

    // คำนวณสถิติพื้นฐาน
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.total_bet_amount, 0);
    const totalPayoutAmount = bets.reduce((sum, bet) => sum + bet.payout_amount, 0);
    const totalProfit = totalBetAmount - totalPayoutAmount;
    const uniquePlayers = [...new Set(bets.map(bet => bet.user_id._id.toString()))];

    // หาผู้เล่นที่แทงมากที่สุด
    const userBetAmounts = {};
    bets.forEach(bet => {
      const userId = bet.user_id._id.toString();
      if (!userBetAmounts[userId]) {
        userBetAmounts[userId] = {
          userId: bet.user_id._id,
          username: bet.user_id.username || bet.user_id.full_name,
          totalBet: 0
        };
      }
      userBetAmounts[userId].totalBet += bet.total_bet_amount;
    });
    const topBetUser = Object.values(userBetAmounts).sort((a, b) => b.totalBet - a.totalBet)[0] || null;

    // หาผู้เล่นที่ถูกรางวัลมากที่สุด
    const userWinAmounts = {};
    bets.forEach(bet => {
      if (bet.payout_amount > 0) {
        const userId = bet.user_id._id.toString();
        if (!userWinAmounts[userId]) {
          userWinAmounts[userId] = {
            userId: bet.user_id._id,
            username: bet.user_id.username || bet.user_id.full_name,
            totalWin: 0
          };
        }
        userWinAmounts[userId].totalWin += bet.payout_amount;
      }
    });
    const topWinUser = Object.values(userWinAmounts).sort((a, b) => b.totalWin - a.totalWin)[0] || null;

    // หาเลขยอดนิยม (เลขที่ถูกแทงมากที่สุด)
    const numberCounts = {};
    bets.forEach(bet => {
      bet.bets.forEach(betDetail => {
        betDetail.numbers.forEach(num => {
          if (!numberCounts[num.number]) {
            numberCounts[num.number] = {
              number: num.number,
              count: 0,
              totalAmount: 0
            };
          }
          numberCounts[num.number].count += 1;
          numberCounts[num.number].totalAmount += num.amount;
        });
      });
    });
    const popularNumbers = Object.values(numberCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // รายการออกรางวัล (เลขที่ถูก)
    const winningNumbers = [];
    bets.forEach(bet => {
      if (bet.status === "won") {
        bet.bets.forEach(betDetail => {
          betDetail.numbers.forEach(num => {
            if (num.is_won) {
              winningNumbers.push({
                number: num.number,
                type: betDetail.betting_name,
                amount: num.amount
              });
            }
          });
        });
      }
    });

    return handleSuccess(
      {
        lotteryName: lotterySet.lottery_type_id?.lottery_type || "ไม่ระบุ",
        lotterySetName: lotterySet.name,
        drawDate: lotterySet.result_time,
        openDate: lotterySet.openTime,
        closeTime: lotterySet.closeTime,
        totalPlayers: uniquePlayers.length,
        totalBetAmount,
        totalPayoutAmount,
        totalProfit,
        topBetUser,
        topWinUser,
        popularNumbers,
        prizeResults: winningNumbers
      },
      "ดึงข้อมูลสถิติหวยสำเร็จ",
      200
    );
  } catch (error) {
    console.error("Error in getLotteryStats:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวย");
  }
};

// ฟังก์ชันหลักสำหรับดึงสถิติตามประเภท
const getStatsByLotteryType = async (lotteryTypeName, startDate, endDate) => {
  try {
    if (!lotteryTypeName) {
      return handleError(null, "กรุณาระบุชื่อประเภทหวย", 400);
    }

    const start = startDate ? new Date(startDate + "T00:00:00.000Z") : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : new Date();

    // หาประเภทหวยจากชื่อ
    console.log("Searching for lottery type:", lotteryTypeName);
    
    // ดึงประเภทหวยทั้งหมดเพื่อ debug
    const allLotteryTypes = await LotteryType.find().select('lottery_type');
    console.log("Available lottery types:", allLotteryTypes.map(lt => lt.lottery_type));
    
    const lotteryType = await LotteryType.findOne({
      lottery_type: { $regex: lotteryTypeName, $options: "i" }
    });

    if (!lotteryType) {
      return handleError(null, `ไม่พบประเภทหวยที่ระบุ: "${lotteryTypeName}". ประเภทที่มี: ${allLotteryTypes.map(lt => lt.lottery_type).join(', ')}`, 404);
    }
    
    console.log("Found lottery type:", lotteryType.lottery_type);

    // หางวดหวยทั้งหมดของประเภทนี้ในช่วงเวลา
    console.log("Searching lottery sets with:", {
      lottery_type_id: lotteryType._id,
      result_time_gte: start,
      result_time_lte: end
    });
    
    const lotterySets = await LotterySets.find({
      lottery_type_id: lotteryType._id,
      result_time: { $gte: start, $lte: end }
    }).sort({ result_time: -1 });
    
    console.log("Found lottery sets:", lotterySets.length);
    
    // ดูงวดทั้งหมดของหวยไทย (ไม่สนช่วงเวลา)
    const allSets = await LotterySets.find({
      lottery_type_id: lotteryType._id
    }).select('name result_time').sort({ result_time: -1 }).limit(5);
    console.log("Latest 5 lottery sets:", allSets.map(s => ({
      name: s.name,
      result_time: s.result_time
    })));

    if (lotterySets.length === 0) {
      return handleSuccess(
        {
          lotteryTypeName: lotteryType.lottery_type,
          lotteryTypeId: lotteryType._id,
          rounds: [],
          summary: {
            totalRounds: 0,
            totalBetAmount: 0,
            totalPayoutAmount: 0,
            totalProfit: 0,
            totalPlayers: 0
          },
          dateRange: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
          }
        },
        "ไม่พบงวดหวยในช่วงเวลาที่กำหนด",
        200
      );
    }

    const lotterySetIds = lotterySets.map(ls => ls._id);

    // ดึงข้อมูลการแทงทั้งหมด
    const allBets = await UserBet.find({
      lottery_set_id: { $in: lotterySetIds },
      status: { $ne: "cancelled" }
    }).populate("user_id", "username full_name");

    // คำนวณสถิติแต่ละงวด
    const rounds = [];
    let totalBetAmount = 0;
    let totalPayoutAmount = 0;
    let allPlayers = new Set();

    for (const lotterySet of lotterySets) {
      const bets = allBets.filter(bet => bet.lottery_set_id.toString() === lotterySet._id.toString());
      
      console.log(`งวด: ${lotterySet.name}, จำนวนการแทง: ${bets.length}`);

      const roundBetAmount = bets.reduce((sum, bet) => sum + bet.total_bet_amount, 0);
      const roundPayoutAmount = bets.reduce((sum, bet) => sum + bet.payout_amount, 0);
      const roundProfit = roundBetAmount - roundPayoutAmount;
      const roundPlayers = [...new Set(bets.map(bet => bet.user_id._id.toString()))];

      // เพิ่มผู้เล่นเข้า Set รวม
      roundPlayers.forEach(player => allPlayers.add(player));

      // หาผู้เล่นที่แทงมากที่สุดในงวดนี้
      const userBetAmounts = {};
      bets.forEach(bet => {
        const userId = bet.user_id._id.toString();
        if (!userBetAmounts[userId]) {
          userBetAmounts[userId] = {
            username: bet.user_id.username || bet.user_id.full_name,
            totalBet: 0
          };
        }
        userBetAmounts[userId].totalBet += bet.total_bet_amount;
      });
      const topBetUser = Object.entries(userBetAmounts)
        .sort((a, b) => b[1].totalBet - a[1].totalBet)[0];

      // หาผู้เล่นที่ถูกรางวัลมากที่สุดในงวดนี้
      const userWinAmounts = {};
      bets.forEach(bet => {
        if (bet.payout_amount > 0) {
          const userId = bet.user_id._id.toString();
          if (!userWinAmounts[userId]) {
            userWinAmounts[userId] = {
              username: bet.user_id.username || bet.user_id.full_name,
              totalWin: 0
            };
          }
          userWinAmounts[userId].totalWin += bet.payout_amount;
        }
      });
      const topWinUser = Object.entries(userWinAmounts)
        .sort((a, b) => b[1].totalWin - a[1].totalWin)[0];

      // หาเลขยอดนิยม
      const numberCounts = {};
      bets.forEach(bet => {
        bet.bets.forEach(betDetail => {
          betDetail.numbers.forEach(num => {
            if (!numberCounts[num.number]) {
              numberCounts[num.number] = { number: num.number, count: 0 };
            }
            numberCounts[num.number].count += 1;
          });
        });
      });
      const popularNumbers = Object.values(numberCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(n => n.number);

      // รายการออกรางวัล
      const prizeTypes = [];
      bets.forEach(bet => {
        if (bet.status === "won") {
          bet.bets.forEach(betDetail => {
            if (!prizeTypes.includes(betDetail.betting_name)) {
              prizeTypes.push(betDetail.betting_name);
            }
          });
        }
      });

      totalBetAmount += roundBetAmount;
      totalPayoutAmount += roundPayoutAmount;

      rounds.push({
        lotterySetId: lotterySet._id,
        lotterySetName: lotterySet.name,
        drawDate: lotterySet.result_time,
        openDate: lotterySet.openTime,
        closeTime: lotterySet.closeTime,
        totalPlayers: roundPlayers.length,
        totalBetAmount: roundBetAmount,
        totalPayoutAmount: roundPayoutAmount,
        totalProfit: roundProfit,
        topBetUser: topBetUser ? {
          username: topBetUser[1].username,
          amount: topBetUser[1].totalBet
        } : null,
        topWinUser: topWinUser ? {
          username: topWinUser[1].username,
          amount: topWinUser[1].totalWin
        } : null,
        popularNumbers,
        prizeTypes
      });
    }

    return handleSuccess(
      {
        lotteryTypeName: lotteryType.lottery_type,
        lotteryTypeId: lotteryType._id,
        rounds,
        summary: {
          totalRounds: rounds.length,
          totalBetAmount,
          totalPayoutAmount,
          totalProfit: totalBetAmount - totalPayoutAmount,
          totalPlayers: allPlayers.size
        },
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }
      },
      "ดึงข้อมูลสถิติหวยตามประเภทสำเร็จ",
      200
    );
  } catch (error) {
    console.error("Error in getStatsByLotteryType:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวย");
  }
};

// ดึงสถิติหวยตามประเภท (ทุกงวดในช่วงเวลา)
exports.getLotteryStatsByType = async ({ lotteryTypeName, startDate, endDate }) => {
  return getStatsByLotteryType(lotteryTypeName, startDate, endDate);
};

// ดึงสถิติหวยไทย/รัฐบาล
exports.getThaiLotteryStats = async ({ startDate, endDate }) => {
  return getStatsByLotteryType("หวยไทย", startDate, endDate);
};

// ดึงสถิติหวยลาว
exports.getLaoLotteryStats = async ({ startDate, endDate }) => {
  return getStatsByLotteryType("หวยลาว", startDate, endDate);
};

// ดึงสถิติหวยฮานอย
exports.getHanoiLotteryStats = async ({ startDate, endDate }) => {
  return getStatsByLotteryType("หวยฮานอย", startDate, endDate);
};

// ดึงสถิติหวย 4D
exports.get4DLotteryStats = async ({ startDate, endDate }) => {
  return getStatsByLotteryType("หวย 4D", startDate, endDate);
};

// ดึงสถิติหวยยี่กี
exports.getYeeKeeLotteryStats = async ({ startDate, endDate }) => {
  return getStatsByLotteryType("หวยยี่กี", startDate, endDate);
};

// ดึงสถิติหวยทุกประเภท
exports.getAllLotteryStats = async ({ startDate, endDate }) => {
  try {
    const start = startDate ? new Date(startDate + "T00:00:00.000Z") : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate + "T23:59:59.999Z") : new Date();

    // ดึงข้อมูลทุกประเภทหวย
    const lotteryTypes = await LotteryType.find();

    const allStats = [];

    for (const lotteryType of lotteryTypes) {
      // หา lottery_set_id ที่เกี่ยวข้อง
      const lotterySets = await LotterySets.find({
        lottery_type_id: lotteryType._id
      });

      const lotterySetIds = lotterySets.map(ls => ls._id);

      // คำนวณสถิติ
      const stats = await UserBet.aggregate([
        {
          $match: {
            lottery_set_id: { $in: lotterySetIds },
            bet_date: { $gte: start, $lte: end },
            status: { $ne: "cancelled" }
          }
        },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: "$total_bet_amount" },
            totalPayoutAmount: { $sum: "$payout_amount" },
            totalProfit: { $sum: { $subtract: ["$total_bet_amount", "$payout_amount"] } },
            totalBets: { $sum: 1 },
            uniquePlayers: { $addToSet: "$user_id" }
          }
        },
        {
          $project: {
            _id: 0,
            totalBetAmount: 1,
            totalPayoutAmount: 1,
            totalProfit: 1,
            totalBets: 1,
            totalPlayers: { $size: "$uniquePlayers" }
          }
        }
      ]);

      const result = stats.length > 0 ? stats[0] : {
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalProfit: 0,
        totalBets: 0,
        totalPlayers: 0
      };

      allStats.push({
        lotteryTypeId: lotteryType._id,
        lotteryTypeName: lotteryType.lottery_type,
        stats: result
      });
    }

    // คำนวณยอดรวมทั้งหมด
    const totalStats = allStats.reduce((acc, item) => ({
      totalBetAmount: acc.totalBetAmount + item.stats.totalBetAmount,
      totalPayoutAmount: acc.totalPayoutAmount + item.stats.totalPayoutAmount,
      totalProfit: acc.totalProfit + item.stats.totalProfit,
      totalBets: acc.totalBets + item.stats.totalBets,
      totalPlayers: acc.totalPlayers + item.stats.totalPlayers
    }), {
      totalBetAmount: 0,
      totalPayoutAmount: 0,
      totalProfit: 0,
      totalBets: 0,
      totalPlayers: 0
    });

    return handleSuccess(
      {
        lotteryStats: allStats,
        summary: totalStats,
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }
      },
      "ดึงข้อมูลสถิติหวยทุกประเภทสำเร็จ",
      200
    );
  } catch (error) {
    console.error("Error in getAllLotteryStats:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติหวย");
  }
};
