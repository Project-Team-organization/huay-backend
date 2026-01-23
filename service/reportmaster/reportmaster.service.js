const User = require("../../models/user.model");
const UserBet = require("../../models/userBetSchema.models");
const Credit = require("../../models/credit.models");
const UserTransaction = require("../../models/user.transection.model");
const Master = require("../../models/master.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.getReportByMasterId = async (master_id) => {
  try {
    // ตรวจสอบว่า master มีอยู่จริง
    const master = await Master.findById(master_id);
    if (!master) {
      return handleError(null, "ไม่พบข้อมูล Master", 404);
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. ดึงข้อมูล users ทั้งหมดที่อยู่ภายใต้ master_id
    const allUsers = await User.find({ master_id }).select("_id username full_name credit active createdAt");
    const userIds = allUsers.map(user => user._id);

    // 2. สถิติ users
    const totalUsers = allUsers.length;
    const newUsersToday = allUsers.filter(user => new Date(user.createdAt) >= todayStart).length;

    // 3. ดึงข้อมูลการเดิมพันทั้งหมด
    const allBets = await UserBet.find({ user_id: { $in: userIds } });
    const todayBets = await UserBet.find({ 
      user_id: { $in: userIds },
      bet_date: { $gte: todayStart, $lte: todayEnd }
    });
    const monthlyBets = await UserBet.find({ 
      user_id: { $in: userIds },
      bet_date: { $gte: monthStart, $lte: monthEnd }
    });

    // 4. หา users ที่เล่นวันนี้ (มีการแทงวันนี้)
    const usersPlayedToday = [...new Set(todayBets.map(bet => bet.user_id.toString()))].length;

    // 5. หา users ที่เล่นเดือนนี้ (มีการแทงเดือนนี้)
    const usersPlayedMonthly = [...new Set(monthlyBets.map(bet => bet.user_id.toString()))].length;

    // 6. คำนวณกำไร/ขาดทุน วันนี้
    let profitToday = 0;
    todayBets.forEach(bet => {
      profitToday += (bet.total_bet_amount || 0) - (bet.payout_amount || 0);
    });

    // 6.5 คำนวณกำไร/ขาดทุน เดือนนี้
    let profitMonthly = 0;
    monthlyBets.forEach(bet => {
      profitMonthly += (bet.total_bet_amount || 0) - (bet.payout_amount || 0);
    });

    // 7. คำนวณกำไร/ขาดทุน รวมทั้งหมด
    let profitTotal = 0;
    allBets.forEach(bet => {
      profitTotal += (bet.total_bet_amount || 0) - (bet.payout_amount || 0);
    });

    // 8. ดึงข้อมูลการถอนเงิน
    const todayWithdrawals = await UserTransaction.find({
      user_id: { $in: userIds },
      type: "withdraw",
      created_at: { $gte: todayStart, $lte: todayEnd }
    });

    const monthlyWithdrawals = await UserTransaction.find({
      user_id: { $in: userIds },
      type: "withdraw",
      created_at: { $gte: monthStart, $lte: monthEnd }
    });
    
    const allWithdrawals = await UserTransaction.find({
      user_id: { $in: userIds },
      type: "withdraw"
    });

    let withdrawToday = 0;
    let withdrawMonthly = 0;
    let withdrawTotal = 0;

    todayWithdrawals.forEach(trans => {
      withdrawToday += trans.amount || 0;
    });

    monthlyWithdrawals.forEach(trans => {
      withdrawMonthly += trans.amount || 0;
    });

    allWithdrawals.forEach(trans => {
      withdrawTotal += trans.amount || 0;
    });

    // 9. คำนวณกำไรสุทธิหลังหักถอน
    const netProfitAfterWithdrawToday = profitToday - withdrawToday;
    const netProfitAfterWithdrawMonthly = profitMonthly - withdrawMonthly;
    const netProfitAfterWithdrawTotal = profitTotal - withdrawTotal;

    // 10. คำนวณเปอร์เซ็นต์กำไร (ใช้ข้อมูลเดือนนี้)
    const monthlyBetAmount = monthlyBets.reduce((sum, bet) => sum + (bet.total_bet_amount || 0), 0);
    const profitPercentage = monthlyBetAmount > 0 ? ((profitMonthly / monthlyBetAmount) * 100).toFixed(2) : 0;

    // 11. สรุปข้อมูลตามรูป (ใช้ข้อมูลเดือนนี้)
    const reportData = {
      master_info: {
        master_id: master._id,
        username: master.username,
        phone: master.phone,
      },
      user_statistics: {
        users_played_today: usersPlayedToday,
        users_played_monthly: usersPlayedMonthly,
        new_users_today: newUsersToday,
        total_users: totalUsers,
      },
      financial_overview: {
        profit_percentage: parseFloat(profitPercentage),
        net_profit: profitMonthly,
      },
      income_expense: {
        profit_today: profitToday,
        profit_total: profitMonthly,
        withdraw_today: withdrawToday,
        withdraw_total: withdrawMonthly,
      },
      net_profit_after_withdraw: netProfitAfterWithdrawMonthly,
    };

    return handleSuccess(reportData, "ดึงข้อมูลรายงาน Master สำเร็จ", 200);
  } catch (error) {
    console.error("Error in getReportByMasterId:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
  }
};
