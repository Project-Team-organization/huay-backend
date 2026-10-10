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
 * @param {Date|string} targetDate วันที่ใช้อ้างอิงสัปดาห์ (default: ถ้าเป็น Manual ตัดรอบสัปดาห์ปัจจุบันทันที / ถ้าเป็น Cron ตัดรอบสัปดาห์ก่อนหน้า)
 * @param {boolean} isManual สั่งรันแบบ Manual หรือไม่
 */
exports.calculateAndProcessWeeklyCashback = async (targetDate = null, isManual = false) => {
  const config = await exports.getCashbackConfig();
  if (!config.is_active) {
    return { success: false, message: "ระบบคืนยอดเสียปิดใช้งานอยู่" };
  }

  // ถ้าเป็นระบบอัตโนมัติ (Cron) แต่แอดมินปิดการตัดจ่ายอัตโนมัติไว้
  if (!isManual && !config.is_auto_payout) {
    return { success: false, message: "ระบบตัดจ่ายคืนยอดเสียอัตโนมัติถูกปิดใช้งาน" };
  }

  // คำนวณช่วงเวลาสัปดาห์
  // - ถ้าเป็น Manual Run และไม่ระบุวันที่ ให้ตัดยอดรอบปัจจุบัน (Current Week) ได้ทันที เพื่อให้ดูผลและตรวจสอบได้ง่าย
  // - ถ้าเป็น Cron Job (วันจันทร์ 00:05) ให้ตัดยอดของสัปดาห์ก่อนหน้า (Previous Week)
  let baseMoment;
  if (targetDate) {
    if (targetDate === "current") {
      baseMoment = moment().tz("Asia/Bangkok");
    } else if (targetDate === "previous") {
      baseMoment = moment().tz("Asia/Bangkok").subtract(1, "weeks");
    } else {
      baseMoment = moment(targetDate).tz("Asia/Bangkok");
    }
  } else {
    baseMoment = isManual
      ? moment().tz("Asia/Bangkok")
      : moment().tz("Asia/Bangkok").subtract(1, "weeks");
  }

  const startDate = baseMoment.clone().startOf("isoWeek").toDate(); // วันจันทร์ 00:00:00
  const endDate = baseMoment.clone().endOf("isoWeek").toDate();     // วันอาทิตย์ 23:59:59

  // 1. ดึงรายการเดิมพันหวย (UserTransaction category: "lottery") ช่วงสัปดาห์นั้น
  const lotteryAgg = await UserTransaction.aggregate([
    {
      $match: {
        created_at: { $gte: startDate, $lte: endDate },
        category: "lottery",
        status: { $ne: "CANCEL" },
      },
    },
    {
      $group: {
        _id: "$user_id",
        totalBet: {
          $sum: {
            $cond: [{ $eq: ["$type", "bet"] }, "$amount", 0],
          },
        },
        totalPayout: {
          $sum: {
            $cond: [{ $eq: ["$type", "payout"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  // 2. ดึงรายการเดิมพันเกม (UserTransaction category: "game") ช่วงสัปดาห์นั้น
  // แยก type: "bet" (ยอดแทง) และ type: "payout" / payout_amount (ยอดเงินรางวัล) อย่างถูกต้อง
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
        totalBet: {
          $sum: {
            $cond: [{ $eq: ["$type", "bet"] }, "$amount", 0],
          },
        },
        totalPayout: {
          $sum: {
            $cond: [
              { $eq: ["$type", "payout"] },
              "$amount",
              { $ifNull: ["$payout_amount", 0] },
            ],
          },
        },
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
    const totalBet = Number((item.totalBet || 0).toFixed(2));
    const totalPayout = Number((item.totalPayout || 0).toFixed(2));
    const netLoss = Number(Math.max(0, totalBet - totalPayout).toFixed(2));

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
    const balanceAfter = Number((balanceBefore + cashbackAmount).toFixed(2));

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

    const lotteryLoss = Number(Math.max(0, (item.lotteryBet || 0) - (item.lotteryPayout || 0)).toFixed(2));
    const gameLoss = Number(Math.max(0, (item.gameBet || 0) - (item.gamePayout || 0)).toFixed(2));

    // บันทึก Log
    const log = await CashbackLog.create({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      total_bet: totalBet,
      total_payout: totalPayout,
      lottery_bet: Number((item.lotteryBet || 0).toFixed(2)),
      lottery_payout: Number((item.lotteryPayout || 0).toFixed(2)),
      game_bet: Number((item.gameBet || 0).toFixed(2)),
      game_payout: Number((item.gamePayout || 0).toFixed(2)),
      net_loss: netLoss,
      cashback_rate: config.percentage,
      cashback_amount: cashbackAmount,
      status: "completed",
      remark: `คืนยอดเสีย ${config.percentage}% (หวยเสีย: ${lotteryLoss}, เกมเสีย: ${gameLoss})`,
    });

    processedCount++;
    totalCashbackPaid = Number((totalCashbackPaid + cashbackAmount).toFixed(2));
    logs.push(log);
  }

  const periodText = isManual && (!targetDate || targetDate === "current")
    ? `รอบปัจจุบัน (${moment(startDate).format("DD/MM/YYYY")} - ${moment(endDate).format("DD/MM/YYYY")})`
    : `รอบวันที่ (${moment(startDate).format("DD/MM/YYYY")} - ${moment(endDate).format("DD/MM/YYYY")})`;

  return {
    success: true,
    message: `ประมวลผลคืนยอดเสีย${periodText}สำเร็จ ${processedCount} รายการ รวมเป็นเงิน ${totalCashbackPaid} บาท`,
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
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = moment(startDate).tz("Asia/Bangkok").startOf("day").toDate();
    }
    if (endDate) {
      filter.createdAt.$lte = moment(endDate).tz("Asia/Bangkok").endOf("day").toDate();
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
    .sort({ createdAt: -1, _id: -1 })
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

  // 1. ดึงรายการเดิมพันหวย (UserTransaction category: "lottery")
  const lotteryAgg = await UserTransaction.aggregate([
    {
      $match: {
        user_id: userObjectId,
        created_at: { $gte: startDate, $lte: endDate },
        category: "lottery",
        status: { $ne: "CANCEL" },
      },
    },
    {
      $group: {
        _id: null,
        totalBet: {
          $sum: {
            $cond: [{ $eq: ["$type", "bet"] }, "$amount", 0],
          },
        },
        totalPayout: {
          $sum: {
            $cond: [{ $eq: ["$type", "payout"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  // 2. ดึงรายการเดิมพันเกม (UserTransaction category: "game")
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
        totalBet: {
          $sum: {
            $cond: [{ $eq: ["$type", "bet"] }, "$amount", 0],
          },
        },
        totalPayout: {
          $sum: {
            $cond: [
              { $eq: ["$type", "payout"] },
              "$amount",
              { $ifNull: ["$payout_amount", 0] },
            ],
          },
        },
      },
    },
  ]);

  const lotteryBet = lotteryAgg.length > 0 ? Number(lotteryAgg[0].totalBet.toFixed(2)) : 0;
  const lotteryPayout = lotteryAgg.length > 0 ? Number(lotteryAgg[0].totalPayout.toFixed(2)) : 0;

  const gameBet = gameAgg.length > 0 ? Number(gameAgg[0].totalBet.toFixed(2)) : 0;
  const gamePayout = gameAgg.length > 0 ? Number(gameAgg[0].totalPayout.toFixed(2)) : 0;

  const totalBet = Number((lotteryBet + gameBet).toFixed(2));
  const totalPayout = Number((lotteryPayout + gamePayout).toFixed(2));
  const netLoss = Number(Math.max(0, totalBet - totalPayout).toFixed(2));

  let estimatedCashback = 0;
  if (config.is_active && netLoss >= config.min_loss_amount) {
    estimatedCashback = Number((netLoss * (config.percentage / 100)).toFixed(2));
    if (config.max_cashback > 0 && estimatedCashback > config.max_cashback) {
      estimatedCashback = config.max_cashback;
    }
  }

  // ดึงประวัติได้รับคืนยอดเสียนัดล่าสุด
  const lastCashback = await CashbackLog.findOne({ user_id: userId })
    .sort({ createdAt: -1, _id: -1 });

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
      lottery_bet: lotteryBet,
      lottery_payout: lotteryPayout,
      game_bet: gameBet,
      game_payout: gamePayout,
      net_loss: netLoss,
      estimated_cashback: estimatedCashback,
    },
    last_cashback: lastCashback,
  };
};
