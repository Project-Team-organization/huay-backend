const mongoose = require("mongoose");
const moment = require("moment-timezone");
const User = require("../../models/user.model");
const ReferralConfig = require("../../models/referralConfig.model");
const UserCommissionLog = require("../../models/userCommissionLog.model");
const UserCommissionClaim = require("../../models/userCommissionClaim.model");
const UserTransaction = require("../../models/user.transection.model");

/**
 * ดึงการตั้งค่าคอมมิชชั่นแนะนำเพื่อน (สร้างค่าเริ่มต้นหากยังไม่มี)
 */
async function getConfig() {
  let config = await ReferralConfig.findOne();
  if (!config) {
    config = await ReferralConfig.create({
      rate: 1.0, // เริ่มต้น 1%
      calculation_type: "turnover",
      min_claim_amount: 100, // ขั้นต่ำ 100 บาท
      is_active: true,
    });
  }
  return config;
}

/**
 * อัปเดตการตั้งค่าคอมมิชชั่นแนะนำเพื่อน (สำหรับ Admin)
 */
async function updateConfig(data, adminId) {
  let config = await ReferralConfig.findOne();
  if (!config) {
    config = new ReferralConfig();
  }

  if (typeof data.rate === "number") config.rate = data.rate;
  if (data.calculation_type) config.calculation_type = data.calculation_type;
  if (typeof data.min_claim_amount === "number") config.min_claim_amount = data.min_claim_amount;
  if (typeof data.is_active === "boolean") config.is_active = data.is_active;
  if (adminId) config.updated_by = adminId;

  await config.save();
  return config;
}

/**
 * ประมวลผลและให้ค่าคอมมิชชั่นแนะนำเพื่อนเมื่อมีการแทง (Lottery หรือ Casino)
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.userId คนที่เดิมพัน (เพื่อน)
 * @param {number} params.betAmount ยอดเดิมพัน
 * @param {string} params.category "lottery" | "game"
 * @param {string|mongoose.Types.ObjectId} params.refId รหัสอ้างอิงของบิลเดิมพัน
 */
async function processBetCommission({ userId, betAmount, category = "lottery", refId = null }) {
  try {
    if (!userId || !betAmount || betAmount <= 0) return null;

    // ตรวจสอบว่าผู้เล่นมีผู้แนะนำหรือไม่
    const player = await User.findById(userId).select("referral_user_id");
    if (!player || !player.referral_user_id) return null;

    const config = await getConfig();
    if (!config.is_active || config.rate <= 0) return null;

    // คำนวณยอดคอมมิชชั่น (ปัดเศษ 2 ตำแหน่ง)
    const commission = Math.round(betAmount * (config.rate / 100) * 100) / 100;
    if (commission <= 0) return null;

    const sourceType = category === "game" ? "bet_game" : "bet_huay";

    // บันทึกประวัติคอมมิชชั่น
    const log = await UserCommissionLog.create({
      user_id: player.referral_user_id,
      referred_user_id: player._id,
      source_type: sourceType,
      ref_id: refId,
      source_amount: betAmount,
      rate: config.rate,
      commission_amount: commission,
      status: "credited",
      created_at: new Date(),
    });

    // อัปเดตยอดคอมมิชชั่นสะสมของผู้แนะนำ
    await User.updateOne(
      { _id: player.referral_user_id },
      {
        $inc: {
          commission_balance: commission,
          total_commission_earned: commission,
        },
      }
    );

    return log;
  } catch (error) {
    console.error("❌ Error in processBetCommission:", error.message);
    return null;
  }
}

/**
 * ดึงภาพรวมสถิติค่าคอมมิชชั่นของผู้ใช้งาน
 * @param {string|mongoose.Types.ObjectId} userId
 */
async function getUserCommissionSummary(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้งาน");

  const config = await getConfig();

  // จำนวนเพื่อนทั้งหมดในสายงาน
  const totalMembers = await User.countDocuments({ referral_user_id: user._id });

  // รายชื่อเพื่อนในสายงาน
  const referredUsers = await User.find({ referral_user_id: user._id }).select("_id").lean();
  const referredUserIds = referredUsers.map((u) => u._id);

  // สมาชิกที่มียอดเล่น (Active)
  let activeMembersCount = 0;
  if (referredUserIds.length > 0) {
    const activeDistinct = await UserTransaction.distinct("user_id", {
      user_id: { $in: referredUserIds },
      type: "bet",
    });
    activeMembersCount = activeDistinct.length;
  }

  // ยอดเล่นและคอมมิชชั่นวันนี้
  const todayStart = moment().tz("Asia/Bangkok").startOf("day").toDate();
  const todayEnd = moment().tz("Asia/Bangkok").endOf("day").toDate();

  let todayEarned = 0;
  let todayBetVolume = 0;
  let activeTodayCount = 0;

  if (referredUserIds.length > 0) {
    const todayCommissionAgg = await UserCommissionLog.aggregate([
      {
        $match: {
          user_id: user._id,
          created_at: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commission_amount" },
          totalBet: { $sum: "$source_amount" },
        },
      },
    ]);

    if (todayCommissionAgg.length > 0) {
      todayEarned = todayCommissionAgg[0].totalCommission || 0;
      todayBetVolume = todayCommissionAgg[0].totalBet || 0;
    }

    const todayActiveDistinct = await UserTransaction.distinct("user_id", {
      user_id: { $in: referredUserIds },
      type: "bet",
      created_at: { $gte: todayStart, $lte: todayEnd },
    });
    activeTodayCount = todayActiveDistinct.length;
  }

  return {
    referral_code: user.referral_code || "",
    referral_link: user.referral_link || "",
    total_members: totalMembers,
    active_members: activeMembersCount,
    active_today: activeTodayCount,
    commission_balance: Math.round((user.commission_balance || 0) * 100) / 100,
    total_commission_claimed: Math.round((user.total_commission_claimed || 0) * 100) / 100,
    total_commission_earned: Math.round((user.total_commission_earned || 0) * 100) / 100,
    today_earned: Math.round(todayEarned * 100) / 100,
    today_bet_volume: Math.round(todayBetVolume * 100) / 100,
    min_claim_amount: config.min_claim_amount,
    current_rate: config.rate,
    is_active: config.is_active,
  };
}

/**
 * ดึงรายชื่อลูกค้าในสายงานพร้อมยอดเล่น (สำหรับหน้า Affiliate)
 */
async function getReferredMembers(userId, { page = 1, limit = 20, search = "" } = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้งาน");

  const query = { referral_user_id: user._id };
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { full_name: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const members = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("username phone full_name createdAt active")
    .lean();

  const todayStart = moment().tz("Asia/Bangkok").startOf("day").toDate();
  const todayEnd = moment().tz("Asia/Bangkok").endOf("day").toDate();

  // ดึงยอดเล่นวันนี้ และยอดเล่นรวมของสมาชิกแต่ละคน
  const memberList = await Promise.all(
    members.map(async (m) => {
      // ปิดบังเบอร์โทร เช่น 081-xxx-5678
      let maskedPhone = m.phone || m.username || "-";
      if (maskedPhone.length >= 8) {
        maskedPhone = `${maskedPhone.slice(0, 3)}-xxx-${maskedPhone.slice(-4)}`;
      }

      // ยอดเล่นวันนี้
      const todayBetAgg = await UserTransaction.aggregate([
        {
          $match: {
            user_id: m._id,
            type: "bet",
            created_at: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);
      const todayBet = todayBetAgg.length > 0 ? todayBetAgg[0].total : 0;

      // คอมมิชชั่นรวมที่สร้างให้เรา
      const commissionAgg = await UserCommissionLog.aggregate([
        {
          $match: {
            user_id: user._id,
            referred_user_id: m._id,
          },
        },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: "$commission_amount" },
            totalBet: { $sum: "$source_amount" },
          },
        },
      ]);

      const commissionEarned = commissionAgg.length > 0 ? commissionAgg[0].totalCommission : 0;
      const totalBet = commissionAgg.length > 0 ? commissionAgg[0].totalBet : 0;

      return {
        id: m._id,
        member_id: `UF${String(m._id).slice(-5).toUpperCase()}`,
        phone: maskedPhone,
        registered_at: m.createdAt,
        today_bet: Math.round(todayBet * 100) / 100,
        total_bet: Math.round(totalBet * 100) / 100,
        commission_earned: Math.round(commissionEarned * 100) / 100,
        active: todayBet > 0 || m.active,
      };
    })
  );

  return {
    members: memberList,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalItems: total,
    },
  };
}

/**
 * กดรับเครดิตคอมมิชชั่นสะสมเข้ากระเป๋าเครดิตหลัก
 * @param {string|mongoose.Types.ObjectId} userId
 */
async function claimCommission(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้งาน");

  const config = await getConfig();
  const balance = user.commission_balance || 0;

  if (balance <= 0) {
    throw new Error("ไม่มียอดคอมมิชชั่นสะสมที่สามารถกดรับได้");
  }

  if (config.min_claim_amount > 0 && balance < config.min_claim_amount) {
    throw new Error(`ยอดสะสมขั้นต่ำในการกดรับคือ ${config.min_claim_amount} บาท (ปัจจุบันมี ${balance} บาท)`);
  }

  const claimAmount = Math.round(balance * 100) / 100;
  const balanceBefore = user.credit || 0;
  const balanceAfter = balanceBefore + claimAmount;

  // ปรับปรุงยอดเงินของผู้ใช้
  user.commission_balance = 0;
  user.total_commission_claimed = (user.total_commission_claimed || 0) + claimAmount;
  user.credit = balanceAfter;
  await user.save();

  // บันทึกรายการกดรับ
  const claimRecord = await UserCommissionClaim.create({
    user_id: user._id,
    amount: claimAmount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    status: "completed",
    created_at: new Date(),
  });

  // บันทึกธุรกรรม UserTransaction เพื่อให้มีประวัติใน statement
  await UserTransaction.create({
    user_id: user._id,
    type: "commission",
    amount: claimAmount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    ref_id: claimRecord._id,
    ref_model: "UserCommissionClaim",
    category: "transaction",
    description: "รับค่าคอมมิชชั่นแนะนำเพื่อน",
    created_at: new Date(),
  });

  return {
    claimed_amount: claimAmount,
    current_credit: balanceAfter,
    commission_balance: 0,
    claim_id: claimRecord._id,
  };
}

/**
 * ประวัติการได้ค่าคอมมิชชั่น
 */
async function getCommissionLogs(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const total = await UserCommissionLog.countDocuments({ user_id: userId });
  const logs = await UserCommissionLog.find({ user_id: userId })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate("referred_user_id", "phone username")
    .lean();

  const formattedLogs = logs.map((l) => {
    let masked = "-";
    if (l.referred_user_id) {
      const p = l.referred_user_id.phone || l.referred_user_id.username || "";
      masked = p.length >= 8 ? `${p.slice(0, 3)}-xxx-${p.slice(-4)}` : p;
    }
    return {
      _id: l._id,
      friend: masked,
      source_type: l.source_type,
      source_amount: l.source_amount,
      rate: l.rate,
      commission_amount: l.commission_amount,
      created_at: l.created_at,
    };
  });

  return {
    logs: formattedLogs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalItems: total,
    },
  };
}

/**
 * ดึงรายการค่าคอมมิชชั่นของ User ทั้งหมด (สำหรับ Admin)
 */
async function getAllUserCommissions({ page = 1, limit = 10, search = "" } = {}) {
  const skip = (page - 1) * limit;
  const query = {
    role: "user",
  };

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { full_name: { $regex: search, $options: "i" } },
      { referral_code: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ total_commission_earned: -1, commission_balance: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("username phone full_name referral_code commission_balance total_commission_claimed total_commission_earned createdAt active")
    .lean();

  const userList = await Promise.all(
    users.map(async (u) => {
      const referralCount = await User.countDocuments({ referral_user_id: u._id });
      return {
        _id: u._id,
        username: u.username,
        phone: u.phone,
        full_name: u.full_name,
        referral_code: u.referral_code || "-",
        referral_count: referralCount,
        commission_balance: Math.round((u.commission_balance || 0) * 100) / 100,
        total_commission_claimed: Math.round((u.total_commission_claimed || 0) * 100) / 100,
        total_commission_earned: Math.round((u.total_commission_earned || 0) * 100) / 100,
        active: u.active,
        createdAt: u.createdAt,
      };
    })
  );

  return {
    users: userList,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalItems: total,
    },
  };
}

module.exports = {
  getConfig,
  updateConfig,
  processBetCommission,
  getUserCommissionSummary,
  getReferredMembers,
  claimCommission,
  getCommissionLogs,
  getAllUserCommissions,
};
