const CashbackConfig = require("../../models/cashbackConfig.model");
const CashbackLog = require("../../models/cashbackLog.model");
const UserBet = require("../../models/userBetSchema.models");
const User = require("../../models/user.model");
const UserTransaction = require("../../models/user.transection.model");
const moment = require("moment-timezone");

/**
 * ⚙️ ดึงข้อมูลการตั้งค่า Cashback (ถ้าไม่มี ให้สร้างค่าเริ่มต้น)
 */
exports.getCashbackConfig = async () => {
  let config = await CashbackConfig.findOne();
  if (!config) {
    config = await CashbackConfig.create({
      percentage: 5,
      min_loss_amount: 0,
      max_cashback: 0,
      is_active: true,
      is_auto_payout: true,
    });
  }
  return config;
};

/**
 * ✏️ อัปเดตการตั้งค่า Cashback
 */
exports.updateCashbackConfig = async (updateData, adminId = null) => {
  let config = await CashbackConfig.findOne();
  if (!config) {
    config = new CashbackConfig();
  }

  if (updateData.percentage !== undefined) config.percentage = updateData.percentage;
  if (updateData.min_loss_amount !== undefined) config.min_loss_amount = updateData.min_loss_amount;
  if (updateData.max_cashback !== undefined) config.max_cashback = updateData.max_cashback;
  if (updateData.is_active !== undefined) config.is_active = updateData.is_active;
  if (updateData.is_auto_payout !== undefined) config.is_auto_payout = updateData.is_auto_payout;
  if (adminId) config.updated_by = adminId;

  await config.save();
  return config;
};

/**
 * 🔄 คำนวณและปรับเครดิตคืนยอดเสียรายสัปดาห์
 * @param {Date|string} targetDate วันที่ใช้อ้างอิงสัปดาห์ (default: สัปดาห์ก่อนหน้า)
 */
exports.calculateAndProcessWeeklyCashback = async (targetDate = null) => {
  const config = await exports.getCashbackConfig();
  if (!config.is_active) {
    return { success: false, message: "ระบบคืนยอดเสียปิดใช้งานอยู่" };
  }

  // คำนวณช่วงเวลาสัปดาห์ที่แล้ว (วันจันทร์ 00:00:00 ถึง วันอาทิตย์ 23:59:59)
  const baseMoment = targetDate
    ? moment(targetDate).tz("Asia/Bangkok")
    : moment().tz("Asia/Bangkok").subtract(1, "weeks");

  const startDate = baseMoment.clone().startOf("isoWeek").toDate(); // วันจันทร์ 00:00:00
  const endDate = baseMoment.clone().endOf("isoWeek").toDate();     // วันอาทิตย์ 23:59:59

  // 1. ดึงรายการเดิมพันหวย (UserBet) ที่สรุปผลแล้วช่วงสัปดาห์นั้น
  const lotteryAgg = await UserBet.aggregate([
    {
      $match: {
        created_at: { $gte: startDate, $lte: endDate },
        status: { $in: ["won", "lost"] },
      },
    },
    {
      $group: {
        _id: "$user_id",
        totalBet: { $sum: "$total_bet_amount" },
        totalPayout: { $sum: "$payout_amount" },
      },
    },
  ]);

  // 2. ดึงรายการเดิมพันเกม (UserTransaction category: "game") ช่วงสัปดาห์นั้น
  const gameAgg = await UserTransaction.aggregate([
    {
      $match: {
        created_at: { $gte: startDate, $lte: endDate },
        category: "game",
        status: { $ne: "CANCEL" },
      },
    },
    {
      $group: {
        _id: "$user_id",
        totalBet: { $sum: "$amount" },
        totalPayout: { $sum: "$payout_amount" },
      },
    },
  ]);

  // รวมผลลัพธ์ทั้งหวยและเกมเข้าด้วยกันแยกตาม User
  const userMap = new Map();

  lotteryAgg.forEach((item) => {
    const userIdStr = item._id.toString();
    userMap.set(userIdStr, {
      userId: item._id,
      lotteryBet: item.totalBet || 0,
      lotteryPayout: item.totalPayout || 0,
      gameBet: 0,
      gamePayout: 0,
      totalBet: item.totalBet || 0,
      totalPayout: item.totalPayout || 0,
    });
  });

  gameAgg.forEach((item) => {
    const userIdStr = item._id.toString();
    const existing = userMap.get(userIdStr) || {
      userId: item._id,
      lotteryBet: 0,
      lotteryPayout: 0,
      gameBet: 0,
      gamePayout: 0,
      totalBet: 0,
      totalPayout: 0,
    };
    existing.gameBet = item.totalBet || 0;
    existing.gamePayout = item.totalPayout || 0;
    existing.totalBet += item.totalBet || 0;
    existing.totalPayout += item.totalPayout || 0;
    userMap.set(userIdStr, existing);
  });

  let processedCount = 0;
  let totalCashbackPaid = 0;
  const logs = [];

  for (const item of userMap.values()) {
    const userId = item.userId;
    const totalBet = item.totalBet || 0;
    const totalPayout = item.totalPayout || 0;
    const netLoss = totalBet - totalPayout;

    // ตรวจสอบเงื่อนไขยอดเสียสุทธิ
    if (netLoss <= 0 || netLoss < config.min_loss_amount) {
      continue;
    }

    // คำนวณเงินคืน
    let cashbackAmount = Number((netLoss * (config.percentage / 100)).toFixed(2));

    // เช็คเพดานเงินคืนสูงสุด
    if (config.max_cashback > 0 && cashbackAmount > config.max_cashback) {
      cashbackAmount = config.max_cashback;
    }

    if (cashbackAmount <= 0) continue;

    // ตรวจสอบว่าสัปดาห์นี้เคยจ่ายเงินคืน User รายนี้ไปแล้วหรือยัง (ป้องกันจ่ายซ้ำ)
    const existingLog = await CashbackLog.findOne({
      user_id: userId,
      start_date: startDate,
    });

    if (existingLog) {
      continue;
    }

    // ปรับเครดิตให้ User
    const user = await User.findById(userId);
    if (!user) continue;

    const balanceBefore = user.credit || 0;
    const balanceAfter = balanceBefore + cashbackAmount;

    user.credit = balanceAfter;
    await user.save();

    // บันทึกธุรกรรม UserTransaction
    await UserTransaction.create({
      user_id: userId,
      type: "rebate",
      amount: cashbackAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "transaction",
      description: `คืนยอดเสียรายสัปดาห์ ${config.percentage}% (${moment(startDate).format("DD/MM/YYYY")} - ${moment(endDate).format("DD/MM/YYYY")})`,
      status: "success",
    });

    // บันทึก Log
    const log = await CashbackLog.create({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      total_bet: totalBet,
      total_payout: totalPayout,
      lottery_bet: item.lotteryBet,
      lottery_payout: item.lotteryPayout,
      game_bet: item.gameBet,
      game_payout: item.gamePayout,
      net_loss: netLoss,
      cashback_rate: config.percentage,
      cashback_amount: cashbackAmount,
      status: "completed",
      remark: `คืนยอดเสีย ${config.percentage}% (หวยเสีย: ${item.lotteryBet - item.lotteryPayout}, เกมเสีย: ${item.gameBet - item.gamePayout})`,
    });

    processedCount++;
    totalCashbackPaid += cashbackAmount;
    logs.push(log);
  }

  return {
    success: true,
    message: `ประมวลผลคืนยอดเสียสำเร็จ ${processedCount} รายการ รวมเป็นเงิน ${totalCashbackPaid} บาท`,
    startDate,
    endDate,
    processedCount,
    totalCashbackPaid,
  };
};

/**
 * 📋 ดึงประวัติรายการคืนยอดเสียสำหรับ Admin
 */
exports.getCashbackHistory = async (query = {}) => {
  const { page = 1, limit = 20, search = "", startDate, endDate } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (startDate || endDate) {
    filter.created_at = {};
    if (startDate) {
      filter.created_at.$gte = moment(startDate).tz("Asia/Bangkok").startOf("day").toDate();
    }
    if (endDate) {
      filter.created_at.$lte = moment(endDate).tz("Asia/Bangkok").endOf("day").toDate();
    }
  }

  if (search) {
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { full_name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const userIds = users.map((u) => u._id);
    filter.user_id = { $in: userIds };
  }

  const total = await CashbackLog.countDocuments(filter);
  const logs = await CashbackLog.find(filter)
    .populate("user_id", "username full_name phone credit")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    data: logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * 👤 ดึงข้อมูลสรุปยอดเสียสัปดาห์ปัจจุบันสำหรับ User
 */
exports.getUserCashbackSummary = async (userId) => {
  const config = await exports.getCashbackConfig();

  const now = moment().tz("Asia/Bangkok");
  const startDate = now.clone().startOf("isoWeek").toDate();
  const endDate = now.clone().endOf("isoWeek").toDate();

  const userObjectId = new (require("mongoose").Types.ObjectId)(userId);

  const lotteryAgg = await UserBet.aggregate([
    {
      $match: {
        user_id: userObjectId,
        created_at: { $gte: startDate, $lte: endDate },
        status: { $in: ["won", "lost"] },
      },
    },
    {
      $group: {
        _id: null,
        totalBet: { $sum: "$total_bet_amount" },
        totalPayout: { $sum: "$payout_amount" },
      },
    },
  ]);

  const gameAgg = await UserTransaction.aggregate([
    {
      $match: {
        user_id: userObjectId,
        created_at: { $gte: startDate, $lte: endDate },
        category: "game",
        status: { $ne: "CANCEL" },
      },
    },
    {
      $group: {
        _id: null,
        totalBet: { $sum: "$amount" },
        totalPayout: { $sum: "$payout_amount" },
      },
    },
  ]);

  const lotteryBet = lotteryAgg.length > 0 ? lotteryAgg[0].totalBet : 0;
  const lotteryPayout = lotteryAgg.length > 0 ? lotteryAgg[0].totalPayout : 0;

  const gameBet = gameAgg.length > 0 ? gameAgg[0].totalBet : 0;
  const gamePayout = gameAgg.length > 0 ? gameAgg[0].totalPayout : 0;

  const totalBet = lotteryBet + gameBet;
  const totalPayout = lotteryPayout + gamePayout;
  const netLoss = Math.max(0, totalBet - totalPayout);

  let estimatedCashback = 0;
  if (config.is_active && netLoss >= config.min_loss_amount) {
    estimatedCashback = Number((netLoss * (config.percentage / 100)).toFixed(2));
    if (config.max_cashback > 0 && estimatedCashback > config.max_cashback) {
      estimatedCashback = config.max_cashback;
    }
  }

  // ดึงประวัติได้รับคืนยอดเสียนัดล่าสุด
  const lastCashback = await CashbackLog.findOne({ user_id: userId })
    .sort({ created_at: -1 });

  return {
    config: {
      percentage: config.percentage,
      min_loss_amount: config.min_loss_amount,
      max_cashback: config.max_cashback,
      is_active: config.is_active,
    },
    current_week: {
      start_date: startDate,
      end_date: endDate,
      total_bet: totalBet,
      total_payout: totalPayout,
      net_loss: netLoss,
      estimated_cashback: estimatedCashback,
    },
    last_cashback: lastCashback,
  };
};
