const User = require("../../models/user.model");
const UserBet = require("../../models/userBetSchema.models");
const Credit = require("../../models/credit.models");
const Withdrawal = require("../../models/withdrawal.models");
const UserTransaction = require("../../models/user.transection.model");
const Master = require("../../models/master.model");
const MasterCommission = require("../../models/masterCommission.model");
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
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 1. ดึงข้อมูล users ทั้งหมดที่อยู่ภายใต้ master_id
    const allUsers = await User.find({ master_id }).select("_id username full_name credit active createdAt");
    const userIds = allUsers.map(user => user._id);

    // 2. สถิติ users
    const totalUsers = allUsers.length;
    const newUsersToday = allUsers.filter(user => new Date(user.createdAt) >= todayStart).length;

    // 3. ดึงข้อมูลการเดิมพันวันนี้
    const todayBets = await UserBet.find({ 
      user_id: { $in: userIds },
      bet_date: { $gte: todayStart, $lte: todayEnd }
    });

    // 4. หา users ที่เล่นวันนี้
    const usersPlayedToday = [...new Set(todayBets.map(bet => bet.user_id.toString()))].length;

    // 5. ดึงข้อมูล MasterCommission ของเดือนปัจจุบัน
    const currentMonthCommission = await MasterCommission.findOne({
      master_id: master_id,
      year: year,
      month: month
    });

    // 6. ดึงข้อมูลฝาก-ถอนวันนี้
    const todayDeposits = await Credit.aggregate([
      {
        $match: {
          master_id: master_id,
          status: 'success',
          created_at: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: '$netAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const todayWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          master_id: master_id,
          status: 'completed',
          created_at: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: '$netAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 7. คำนวณข้อมูลวันนี้
    const depositToday = todayDeposits[0]?.total_amount || 0;
    const withdrawToday = todayWithdrawals[0]?.total_amount || 0;
    
    // คำนวณค่าคอมฯ วันนี้
    const todayDepositCommission = await Credit.aggregate([
      {
        $match: {
          master_id: master_id,
          status: 'success',
          created_at: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total_commission: { $sum: '$commission_amount' }
        }
      }
    ]);
    
    const todayWithdrawalCommission = await Withdrawal.aggregate([
      {
        $match: {
          master_id: master_id,
          status: 'completed',
          created_at: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total_commission: { $sum: '$commission_amount' }
        }
      }
    ]);
    
    const commissionToday = (todayDepositCommission[0]?.total_commission || 0) + (todayWithdrawalCommission[0]?.total_commission || 0);

    // 8. ข้อมูลเดือนนี้ (จาก MasterCommission)
    const depositMonthly = currentMonthCommission?.total_deposit_amount || 0;
    const withdrawMonthly = currentMonthCommission?.total_withdrawal_amount || 0;
    const commissionMonthly = currentMonthCommission?.net_commission || 0; // กำไรของ Master
    const usersPlayedMonthly = currentMonthCommission?.user_count || 0;

    // 9. คำนวณเปอร์เซ็นต์กำไร (กำไร Master / ยอดฝาก * 100)
    const profitPercentage = depositMonthly > 0 
      ? ((commissionMonthly / depositMonthly) * 100).toFixed(2) 
      : 0;

    // 10. สรุปข้อมูลตามโครงเดิม
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
        net_profit: commissionMonthly, // กำไรของ Master (ค่าคอมฯ)
      },
      income_expense: {
        profit_today: commissionToday, // กำไรวันนี้ (ค่าคอมฯ)
        profit_total: commissionMonthly, // กำไรเดือนนี้ (ค่าคอมฯ)
        withdraw_today: withdrawToday,
        withdraw_total: withdrawMonthly,
      },
      net_profit_after_withdraw: commissionMonthly, // กำไรสุทธิของ Master
    };

    return handleSuccess(reportData, "ดึงข้อมูลรายงาน Master สำเร็จ", 200);
  } catch (error) {
    console.error("Error in getReportByMasterId:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
  }
};
