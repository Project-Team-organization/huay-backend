const mongoose = require("mongoose");
const MasterCommission = require("../../models/masterCommission.model");
const Master = require("../../models/master.model");
const User = require("../../models/user.model");
const Credit = require("../../models/credit.models");
const Withdrawal = require("../../models/withdrawal.models");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

/**
 * อัพเดท MasterCommission เมื่อมีการฝาก
 */
exports.updateCommissionOnDeposit = async creditData => {
  try {
    const { user_id, master_id, netAmount, commission_amount, system_profit } =
      creditData;

    if (!master_id) return null;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const period_start = new Date(year, month - 1, 1);
    const period_end = new Date(year, month, 0, 23, 59, 59, 999);

    // ดึง commission_percentage จาก Master
    const master = await Master.findById(master_id).select(
      "commission_percentage",
    );
    const commissionPercentage = master?.commission_percentage || 0;

    // หา unique users ที่มี transaction ในเดือนนี้
    const uniqueUsers = await Credit.distinct("user_id", {
      master_id: master_id,
      status: "success",
      created_at: { $gte: period_start, $lte: period_end },
    });

    const commission = await MasterCommission.findOneAndUpdate(
      {
        master_id: master_id,
        year: year,
        month: month,
      },
      {
        $setOnInsert: {
          master_id: master_id,
          year: year,
          month: month,
          period_start: period_start,
          period_end: period_end,
          status: "active",
        },
        $inc: {
          total_deposit_amount: netAmount,
          total_deposit_count: 1,
          total_deposit_commission: commission_amount,
          total_deposit_system_profit: system_profit,
          net_amount: netAmount,
          net_commission: commission_amount,
          net_system_profit: system_profit,
        },
        $set: {
          user_count: uniqueUsers.length,
          commission_percentage: commissionPercentage,
          last_updated_at: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
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
exports.updateCommissionOnWithdrawal = async withdrawalData => {
  try {
    const { user_id, master_id, netAmount, commission_amount, system_loss } =
      withdrawalData;

    if (!master_id) return null;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const period_start = new Date(year, month - 1, 1);
    const period_end = new Date(year, month, 0, 23, 59, 59, 999);

    // ดึง commission_percentage จาก Master
    const master = await Master.findById(master_id).select(
      "commission_percentage",
    );
    const commissionPercentage = master?.commission_percentage || 0;

    // หา unique users ที่มี transaction ในเดือนนี้ (รวมทั้งฝากและถอน)
    const Withdrawal = require("../../models/withdrawal.models");
    const uniqueUsersWithdrawal = await Withdrawal.distinct("user_id", {
      master_id: master_id,
      status: "completed",
      created_at: { $gte: period_start, $lte: period_end },
    });

    const Credit = require("../../models/credit.models");
    const uniqueUsersDeposit = await Credit.distinct("user_id", {
      master_id: master_id,
      status: "success",
      created_at: { $gte: period_start, $lte: period_end },
    });

    // รวม unique users จากทั้งสองแหล่ง
    const allUniqueUsers = [
      ...new Set([
        ...uniqueUsersWithdrawal.map(id => id.toString()),
        ...uniqueUsersDeposit.map(id => id.toString()),
      ]),
    ];

    const commission = await MasterCommission.findOneAndUpdate(
      {
        master_id: master_id,
        year: year,
        month: month,
      },
      {
        $setOnInsert: {
          master_id: master_id,
          year: year,
          month: month,
          period_start: period_start,
          period_end: period_end,
          status: "active",
        },
        $inc: {
          total_withdrawal_amount: netAmount,
          total_withdrawal_count: 1,
          total_withdrawal_commission: commission_amount,
          total_withdrawal_system_loss: system_loss,
          net_amount: -netAmount,
          net_commission: commission_amount,
          net_system_profit: -system_loss,
        },
        $set: {
          user_count: allUniqueUsers.length,
          commission_percentage: commissionPercentage,
          last_updated_at: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
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
exports.calculateCommission = async (
  userId,
  amount,
  transactionType = "deposit",
) => {
  try {
    console.log("🔍 calculateCommission called:", {
      userId,
      amount,
      transactionType,
    });

    const user = await User.findById(userId);
    console.log("👤 User found:", {
      userId: user?._id,
      master_id_raw: user?.master_id,
      hasMasterId: !!user?.master_id,
    });

    if (!user || !user.master_id) {
      console.log(
        "⚠️ No user or no master_id field - returning null commission",
      );
      return {
        master_id: null,
        commission_percentage: 0,
        commission_amount: 0,
        system_profit: amount,
        system_loss: 0,
      };
    }

    // Query master แยก เพื่อเช็คว่ามีจริงหรือไม่
    const master = await Master.findById(user.master_id);

    if (!master) {
      console.log(
        "⚠️ Master not found in database - returning null commission",
      );
      return {
        master_id: null,
        commission_percentage: 0,
        commission_amount: 0,
        system_profit: amount,
        system_loss: 0,
      };
    }

    const commissionPercentage = master.commission_percentage || 0;
    console.log("💰 Master commission:", {
      masterId: master._id,
      percentage: commissionPercentage,
    });

    if (transactionType === "deposit") {
      const commissionAmount = (amount * commissionPercentage) / 100;
      const systemProfit = amount - commissionAmount;

      console.log("✅ Deposit commission calculated:", {
        commissionAmount,
        systemProfit,
      });

      return {
        master_id: master._id,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        system_profit: systemProfit,
        system_loss: 0,
      };
    } else if (transactionType === "withdrawal") {
      const commissionAmount = -((amount * commissionPercentage) / 100);
      const systemLoss = amount - Math.abs(commissionAmount);

      console.log("✅ Withdrawal commission calculated:", {
        commissionAmount,
        systemLoss,
      });

      return {
        master_id: master._id,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        system_profit: 0,
        system_loss: systemLoss,
      };
    }

    return {
      master_id: null,
      commission_percentage: 0,
      commission_amount: 0,
      system_profit: 0,
      system_loss: 0,
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
      .populate("master_id", "username phone commission_percentage")
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
exports.getCurrentMonthCommission = async masterId => {
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
      month: month,
    }).populate("master_id", "username phone commission_percentage");

    if (!commission) {
      return handleSuccess(null, "ยังไม่มีข้อมูลค่าคอมมิชชั่นในเดือนนี้", 200);
    }

    return handleSuccess(
      commission,
      "ดึงข้อมูลค่าคอมมิชชั่นเดือนปัจจุบันสำเร็จ",
      200,
    );
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
        .populate("master_id", "username phone commission_percentage")
        .sort({ year: -1, month: -1, created_at: -1 })
        .skip(skip)
        .limit(limit),
      MasterCommission.countDocuments(query),
    ]);

    const pagination = {
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / parseInt(perPage)),
    };

    return handleSuccess(
      commissions,
      "ดึงข้อมูลค่าคอมมิชชั่นทั้งหมดสำเร็จ",
      200,
      pagination,
    );
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
        status: "active",
      },
      {
        $set: {
          status: "closed",
          last_updated_at: new Date(),
        },
      },
      { new: true },
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

    if (commission.status === "paid") {
      return handleError(null, "ค่าคอมมิชชั่นนี้จ่ายเงินแล้ว", 400);
    }

    commission.status = "paid";
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

/**
 * ดึงรายละเอียด transactions ของ commission แต่ละ ID
 */
exports.getCommissionTransactions = async (commissionId, filters = {}) => {
  try {
    const commission = await MasterCommission.findById(commissionId);

    if (!commission) {
      return handleError(null, "ไม่พบข้อมูลค่าคอมมิชชั่น", 404);
    }

    // ตรวจสอบว่ามี master_id หรือไม่
    if (!commission.master_id) {
      return handleError(null, "ไม่พบข้อมูล Master ของ Commission นี้", 404);
    }

    // ถ้าเป็น Master ต้องเช็คว่าเป็น commission ของตัวเองหรือไม่
    const { page = 1, perPage = 20, type, userId, userRole } = filters;

    if (userRole === "master" && userId) {
      if (commission.master_id.toString() !== userId.toString()) {
        return handleError(null, "คุณไม่มีสิทธิ์ดูข้อมูล Commission นี้", 403);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    const period_start = commission.period_start;
    const period_end = commission.period_end;

    // ใช้ master_id โดยตรง
    const masterId = commission.master_id;

    const baseQuery = {
      master_id: masterId,
      created_at: { $gte: period_start, $lte: period_end },
    };

    let deposits = [];
    let withdrawals = [];
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    // ดึงข้อมูลตาม type ที่ระบุ
    if (!type || type === "deposit") {
      [deposits, totalDeposits] = await Promise.all([
        Credit.find({ ...baseQuery, status: "success" })
          .populate("user_id", "username phone")
          .sort({ created_at: -1 })
          .skip(type === "deposit" ? skip : 0)
          .limit(type === "deposit" ? limit : 0)
          .select(
            "user_id amount netAmount fee commission_percentage commission_amount system_profit channel description status created_at",
          ),
        Credit.countDocuments({ ...baseQuery, status: "success" }),
      ]);
    }

    if (!type || type === "withdrawal") {
      [withdrawals, totalWithdrawals] = await Promise.all([
        Withdrawal.find({ ...baseQuery, status: "completed" })
          .populate("user_id", "username phone")
          .sort({ created_at: -1 })
          .skip(type === "withdrawal" ? skip : 0)
          .limit(type === "withdrawal" ? limit : 0)
          .select(
            "user_id amount netAmount fee commission_percentage commission_amount system_loss bank_name bank_number account_name description status created_at",
          ),
        Withdrawal.countDocuments({ ...baseQuery, status: "completed" }),
      ]);
    }

    // ถ้าไม่ระบุ type จะรวมทั้งฝากและถอน แล้วเรียงตามวันที่
    let transactions = [];
    let total = 0;

    if (!type) {
      // รวม transactions และเรียงตามวันที่
      const allTransactions = [
        ...deposits.map(d => ({ ...d.toObject(), type: "deposit" })),
        ...withdrawals.map(w => ({ ...w.toObject(), type: "withdrawal" })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      total = totalDeposits + totalWithdrawals;
      transactions = allTransactions.slice(skip, skip + limit);
    } else if (type === "deposit") {
      transactions = deposits.map(d => ({ ...d.toObject(), type: "deposit" }));
      total = totalDeposits;
    } else if (type === "withdrawal") {
      transactions = withdrawals.map(w => ({
        ...w.toObject(),
        type: "withdrawal",
      }));
      total = totalWithdrawals;
    }

    const pagination = {
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / parseInt(perPage)),
    };

    // Query master info แยก
    const masterInfo = await Master.findById(masterId).select(
      "username phone commission_percentage",
    );

    const result = {
      commission: {
        _id: commission._id,
        master_id: masterInfo,
        year: commission.year,
        month: commission.month,
        period_start: commission.period_start,
        period_end: commission.period_end,
        total_deposit_amount: commission.total_deposit_amount,
        total_deposit_count: commission.total_deposit_count,
        total_deposit_commission: commission.total_deposit_commission,
        total_withdrawal_amount: commission.total_withdrawal_amount,
        total_withdrawal_count: commission.total_withdrawal_count,
        total_withdrawal_commission: commission.total_withdrawal_commission,
        net_amount: commission.net_amount,
        net_commission: commission.net_commission,
        status: commission.status,
      },
      transactions,
      summary: {
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        total_transactions: totalDeposits + totalWithdrawals,
      },
    };

    return handleSuccess(
      result,
      "ดึงข้อมูล transactions สำเร็จ",
      200,
      pagination,
    );
  } catch (error) {
    console.error("Error in getCommissionTransactions:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูล transactions");
  }
};

/**
 * ดึงธุรกรรมฝาก-ถอนทั้งหมดของ Master (ไม่ผูกเดือน) พร้อม filter
 */
exports.getMasterTransactions = async (masterId, filters = {}) => {
  try {
    // ตรวจ input ทั้งหมดก่อนแตะ DB
    if (!mongoose.isValidObjectId(masterId)) {
      return handleError(null, "Master ID ไม่ถูกต้อง", 400);
    }

    const { type, startDate, endDate, username } = filters;

    if (type && type !== "deposit" && type !== "withdrawal") {
      return handleError(null, "type ไม่ถูกต้อง", 400);
    }

    const page = Math.min(Math.max(parseInt(filters.page) || 1, 1), 1000);
    const perPage = Math.min(Math.max(parseInt(filters.perPage) || 20, 1), 100);
    const skip = (page - 1) * perPage;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const created_at = {};
    if (startDate) {
      if (!dateRegex.test(startDate)) {
        return handleError(null, "startDate ไม่ถูกต้อง", 400);
      }
      const start = new Date(`${startDate}T00:00:00.000+07:00`);
      if (isNaN(start.getTime())) {
        return handleError(null, "startDate ไม่ถูกต้อง", 400);
      }
      created_at.$gte = start;
    }
    if (endDate) {
      if (!dateRegex.test(endDate)) {
        return handleError(null, "endDate ไม่ถูกต้อง", 400);
      }
      const end = new Date(`${endDate}T23:59:59.999+07:00`);
      if (isNaN(end.getTime())) {
        return handleError(null, "endDate ไม่ถูกต้อง", 400);
      }
      created_at.$lte = end;
    }

    const baseQuery = { master_id: masterId };
    if (created_at.$gte || created_at.$lte) {
      baseQuery.created_at = created_at;
    }

    const emptyResult = () =>
      handleSuccess(
        {
          transactions: [],
          summary: {
            total_deposits: 0,
            total_withdrawals: 0,
            total_transactions: 0,
          },
        },
        "ดึงข้อมูล transactions สำเร็จ",
        200,
        { total: 0, page, perPage, totalPages: 0 },
      );

    if (username && String(username).trim()) {
      const escaped = String(username)
        .trim()
        .slice(0, 50)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const users = await User.find({
        master_id: masterId,
        username: { $regex: escaped, $options: "i" },
      })
        .select("_id")
        .limit(1000);
      if (users.length === 0) {
        return emptyResult();
      }
      baseQuery.user_id = { $in: users.map(u => u._id) };
    }

    const depositSelect =
      "user_id amount netAmount fee commission_percentage commission_amount system_profit channel description status created_at";
    const withdrawalSelect =
      "user_id amount netAmount fee commission_percentage commission_amount system_loss bank_name bank_number account_name description status created_at";

    let deposits = [];
    let withdrawals = [];
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    if (!type || type === "deposit") {
      [deposits, totalDeposits] = await Promise.all([
        Credit.find({ ...baseQuery, status: "success" })
          .populate("user_id", "username phone")
          .sort({ created_at: -1 })
          .skip(type === "deposit" ? skip : 0)
          .limit(type === "deposit" ? perPage : skip + perPage)
          .select(depositSelect)
          .lean(),
        Credit.countDocuments({ ...baseQuery, status: "success" }),
      ]);
    }

    if (!type || type === "withdrawal") {
      [withdrawals, totalWithdrawals] = await Promise.all([
        Withdrawal.find({ ...baseQuery, status: "completed" })
          .populate("user_id", "username phone")
          .sort({ created_at: -1 })
          .skip(type === "withdrawal" ? skip : 0)
          .limit(type === "withdrawal" ? perPage : skip + perPage)
          .select(withdrawalSelect)
          .lean(),
        Withdrawal.countDocuments({ ...baseQuery, status: "completed" }),
      ]);
    }

    const tagged = [
      ...deposits.map(d => ({ ...d, type: "deposit" })),
      ...withdrawals.map(w => ({ ...w, type: "withdrawal" })),
    ];

    let transactions;
    if (type) {
      transactions = tagged;
    } else {
      transactions = tagged
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(skip, skip + perPage);
    }

    const total = totalDeposits + totalWithdrawals;

    return handleSuccess(
      {
        transactions,
        summary: {
          total_deposits: totalDeposits,
          total_withdrawals: totalWithdrawals,
          total_transactions: total,
        },
      },
      "ดึงข้อมูล transactions สำเร็จ",
      200,
      { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    );
  } catch (error) {
    console.error("Error in getMasterTransactions:", error);
    return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูล transactions");
  }
};
