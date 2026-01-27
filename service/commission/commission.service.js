const MasterCommission = require("../../models/masterCommission.model");
const Master = require("../../models/master.model");
const User = require("../../models/user.model");
const Credit = require("../../models/credit.models");
const Withdrawal = require("../../models/withdrawal.models");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

/**
 * อัพเดท MasterCommission เมื่อมีการฝาก
 */
exports.updateCommissionOnDeposit = async (creditData) => {
  try {
    const { user_id, master_id, netAmount, commission_amount, system_profit } = creditData;
    
    if (!master_id) return null;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const period_start = new Date(year, month - 1, 1);
    const period_end = new Date(year, month, 0, 23, 59, 59, 999);
    
    // หา unique users ที่มี transaction ในเดือนนี้
    const uniqueUsers = await Credit.distinct('user_id', {
      master_id: master_id,
      status: 'success',
      created_at: { $gte: period_start, $lte: period_end }
    });
    
    const commission = await MasterCommission.findOneAndUpdate(
      {
        master_id: master_id,
        year: year,
        month: month
      },
      {
        $setOnInsert: {
          master_id: master_id,
          year: year,
          month: month,
          period_start: period_start,
          period_end: period_end,
          status: 'active'
        },
        $inc: {
          total_deposit_amount: netAmount,
          total_deposit_count: 1,
          total_deposit_commission: commission_amount,
          total_deposit_system_profit: system_profit,
          net_amount: netAmount,
          net_commission: commission_amount,
          net_system_profit: system_profit
        },
        $set: {
          user_count: uniqueUsers.length,
          last_updated_at: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );
    
    return commission;
  } catch (error) {
    console.error("Error in updateCommissionOnDeposit:", error);
    throw error;
  }
};

/**
 * อัพเดท MasterCommission เมื่อมีการถอน
 */
exports.updateCommissionOnWithdrawal = async (withdrawalData) => {
  try {
    const { user_id, master_id, netAmount, commission_amount, system_loss } = withdrawalData;
    
    if (!master_id) return null;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const period_start = new Date(year, month - 1, 1);
    const period_end = new Date(year, month, 0, 23, 59, 59, 999);
    
    // หา unique users ที่มี transaction ในเดือนนี้ (รวมทั้งฝากและถอน)
    const Withdrawal = require("../../models/withdrawal.models");
    const uniqueUsersWithdrawal = await Withdrawal.distinct('user_id', {
      master_id: master_id,
      status: 'completed',
      created_at: { $gte: period_start, $lte: period_end }
    });
    
    const Credit = require("../../models/credit.models");
    const uniqueUsersDeposit = await Credit.distinct('user_id', {
      master_id: master_id,
      status: 'success',
      created_at: { $gte: period_start, $lte: period_end }
    });
    
    // รวม unique users จากทั้งสองแหล่ง
    const allUniqueUsers = [...new Set([...uniqueUsersWithdrawal.map(id => id.toString()), ...uniqueUsersDeposit.map(id => id.toString())])];
    
    const commission = await MasterCommission.findOneAndUpdate(
      {
        master_id: master_id,
        year: year,
        month: month
      },
      {
        $setOnInsert: {
          master_id: master_id,
          year: year,
          month: month,
          period_start: period_start,
          period_end: period_end,
          status: 'active'
        },
        $inc: {
          total_withdrawal_amount: netAmount,
          total_withdrawal_count: 1,
          total_withdrawal_commission: commission_amount,
          total_withdrawal_system_loss: system_loss,
          net_amount: -netAmount,
          net_commission: commission_amount,
          net_system_profit: -system_loss
        },
        $set: {
          user_count: allUniqueUsers.length,
          last_updated_at: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );
    
    return commission;
  } catch (error) {
    console.error("Error in updateCommissionOnWithdrawal:", error);
    throw error;
  }
};

/**
 * คำนวณค่าคอมมิชชั่นจากยอดเงิน
 */
exports.calculateCommission = async (userId, amount, transactionType = 'deposit') => {
  try {
    const user = await User.findById(userId).populate('master_id');
    
    if (!user || !user.master_id) {
      return {
        master_id: null,
        commission_percentage: 0,
        commission_amount: 0,
        system_profit: amount,
        system_loss: 0
      };
    }
    
    const master = user.master_id;
    const commissionPercentage = master.commission_percentage || 0;
    
    if (transactionType === 'deposit') {
      const commissionAmount = (amount * commissionPercentage) / 100;
      const systemProfit = amount - commissionAmount;
      
      return {
        master_id: master._id,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        system_profit: systemProfit,
        system_loss: 0
      };
    } else if (transactionType === 'withdrawal') {
      const commissionAmount = -((amount * commissionPercentage) / 100);
      const systemLoss = amount - Math.abs(commissionAmount);
      
      return {
        master_id: master._id,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        system_profit: 0,
        system_loss: systemLoss
      };
    }
    
    return {
      master_id: null,
      commission_percentage: 0,
      commission_amount: 0,
      system_profit: 0,
      system_loss: 0
    };
  } catch (error) {
    console.error("Error in calculateCommission:", error);
    throw error;
  }
};

/**
 * ดึงรายงานค่าคอมมิชชั่นของ Master
 */
exports.getMasterCommission = async (masterId, year, month) => {
  try {
    const master = await Master.findById(masterId);
    if (!master) {
      return handleError(null, "ไม่พบข้อมูล Master", 404);
    }
    
    const query = { master_id: masterId };
    
    if (year && month) {
      query.year = parseInt(year);
      query.month = parseInt(month);
    } else if (year) {
      query.year = parseInt(year);
    }
    
    const commissions = await MasterCommission.find(query)
      .populate('master_id', 'username phone commission_percentage')
      .sort({ year: -1, month: -1 });
    
    return handleSuccess(commissions, "ดึงข้อมูลค่าคอมมิชชั่นสำเร็จ", 200);
  } catch (error) {
    console.error("Error in getMasterCommission:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่น");
  }
};

/**
 * ดึงรายงานค่าคอมมิชชั่นปัจจุบัน (เดือนนี้)
 */
exports.getCurrentMonthCommission = async (masterId) => {
  try {
    const master = await Master.findById(masterId);
    if (!master) {
      return handleError(null, "ไม่พบข้อมูล Master", 404);
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const commission = await MasterCommission.findOne({
      master_id: masterId,
      year: year,
      month: month
    }).populate('master_id', 'username phone commission_percentage');
    
    if (!commission) {
      return handleSuccess(null, "ยังไม่มีข้อมูลค่าคอมมิชชั่นในเดือนนี้", 200);
    }
    
    return handleSuccess(commission, "ดึงข้อมูลค่าคอมมิชชั่นเดือนปัจจุบันสำเร็จ", 200);
  } catch (error) {
    console.error("Error in getCurrentMonthCommission:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่น");
  }
};

/**
 * ดึงรายงานค่าคอมมิชชั่นทั้งหมด (สำหรับ Admin)
 */
exports.getAllMasterCommissions = async (filters = {}) => {
  try {
    const { page = 1, perPage = 10, year, month, status, masterId } = filters;
    
    const query = {};
    
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (status) query.status = status;
    if (masterId) query.master_id = masterId;
    
    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);
    
    const [commissions, total] = await Promise.all([
      MasterCommission.find(query)
        .populate('master_id', 'username phone commission_percentage')
        .sort({ year: -1, month: -1, created_at: -1 })
        .skip(skip)
        .limit(limit),
      MasterCommission.countDocuments(query)
    ]);
    
    const pagination = {
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / parseInt(perPage))
    };
    
    return handleSuccess(commissions, "ดึงข้อมูลค่าคอมมิชชั่นทั้งหมดสำเร็จ", 200, pagination);
  } catch (error) {
    console.error("Error in getAllMasterCommissions:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลค่าคอมมิชชั่น");
  }
};

/**
 * ปิดเดือนและเปลี่ยนสถานะเป็น closed
 */
exports.closeMonthCommission = async (masterId, year, month) => {
  try {
    const commission = await MasterCommission.findOneAndUpdate(
      {
        master_id: masterId,
        year: parseInt(year),
        month: parseInt(month),
        status: 'active'
      },
      {
        $set: {
          status: 'closed',
          last_updated_at: new Date()
        }
      },
      { new: true }
    );
    
    if (!commission) {
      return handleError(null, "ไม่พบข้อมูลค่าคอมมิชชั่นที่ต้องการปิด", 404);
    }
    
    return handleSuccess(commission, "ปิดเดือนค่าคอมมิชชั่นสำเร็จ", 200);
  } catch (error) {
    console.error("Error in closeMonthCommission:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการปิดเดือนค่าคอมมิชชั่น");
  }
};

/**
 * จ่ายเงินค่าคอมมิชชั่น
 */
exports.payCommission = async (commissionId, adminId) => {
  try {
    const commission = await MasterCommission.findById(commissionId);
    
    if (!commission) {
      return handleError(null, "ไม่พบข้อมูลค่าคอมมิชชั่น", 404);
    }
    
    if (commission.status === 'paid') {
      return handleError(null, "ค่าคอมมิชชั่นนี้จ่ายเงินแล้ว", 400);
    }
    
    commission.status = 'paid';
    commission.paid_at = new Date();
    commission.paid_by = adminId;
    commission.last_updated_at = new Date();
    
    await commission.save();
    
    return handleSuccess(commission, "จ่ายเงินค่าคอมมิชชั่นสำเร็จ", 200);
  } catch (error) {
    console.error("Error in payCommission:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการจ่ายเงินค่าคอมมิชชั่น");
  }
};
