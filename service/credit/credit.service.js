const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Credit = require("../../models/credit.models");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");
const UserTransaction = require("../../models/user.transection.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const commissionService = require("../commission/commission.service");
const { deleteFile } = require("../../middleware/upload.middleware");
//อันเก่า

exports.createCredit = async function ({
  user_id,
  amount,
  channel,
  description,
  slip_image,
  slip_image_original_name,
  addcredit_admin_id,
  addcredit_admin_name,
  addcredit_admin_role,
}) {
  try {
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }

    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }

    // เช็คว่ามีี  userPromotions  หรือยัง  ถ้าไม่มีให้สร้าง
    let userPromotion = await UserPromotion.findOne({ user_id });
    if (!userPromotion) {
      // ทำการสร้างใหม่
      const newUserPromotion = new UserPromotion({
        user_id,
        balance: 0,
        promotions: [],
      });
      userPromotion = await newUserPromotion.save();
    }

    // เช็ค promotion  ว่า มีอยุ่ในช่วงเวลานี้ไหม  ถ้า endDate เป็น null แปลว่าไม่มีวันอายุโปร ดึงมา  และต้องเป็น ประเภท  daily-deposit instant-bonus turnover-bonus
    const promotions = await Promotion.find({
      type: { $in: ["daily-deposit", "instant-bonus", "turnover-bonus"] },
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $gte: new Date() } }, { endDate: null }],
    });

    // กรองโปรโมชั่นตาม target ที่เหมาะสมกับผู้ใช้
    const eligiblePromotions = promotions.filter(promotion => {
      return isUserEligibleForPromotion(user, promotion);
    });

    let credit_promotion = 0;
    let promotion_id = null;

    if (eligiblePromotions.length > 0) {
      console.log(
        `🎯 Found ${eligiblePromotions.length} eligible promotions for user ${user._id}`,
      );

      // ตรวจสอบโปรที่มีอยู่ก่อน
      const existingResult = await checkExistingPromotions(
        user,
        userPromotion,
        eligiblePromotions,
        amount,
      );

      if (existingResult.foundActivePromotion) {
        // พบโปรที่กำลังดำเนินการและได้รับโบนัสแล้ว
        console.log(
          `💰 Found active promotion, bonus: ${existingResult.credit_promotion}`,
        );
        credit_promotion = existingResult.credit_promotion;
        promotion_id = existingResult.promotion_id;
      } else {
        // ไม่พบโปรที่กำลังดำเนินการ ให้ตรวจสอบโปรใหม่
        console.log(`🆕 Checking new promotions...`);
        const newResult = await checkNewPromotions(
          user,
          userPromotion,
          eligiblePromotions,
          amount,
        );
        credit_promotion = newResult.credit_promotion;
        promotion_id = newResult.promotion_id;
        console.log(`💰 New promotion result, bonus: ${credit_promotion}`);
      }
    } else {
      console.log(`❌ No eligible promotions found for user ${user._id}`);
    }

    // บันทึกข้อมูล userPromotion
    console.log(`💾 Saving userPromotion for user ${user._id}...`);
    await userPromotion.save();
    console.log(`✅ UserPromotion saved successfully for user ${user._id}`);

    // ตรวจสอบสถานะสุดท้ายของ promotions
    if (userPromotion.promotions && userPromotion.promotions.length > 0) {
      console.log(`📋 Final promotion statuses for user ${user._id}:`);
      userPromotion.promotions.forEach(promo => {
        console.log(
          `  - Promotion ${promo.promotion_id}: ${promo.status}, Reward: ${promo.reward.amount}`,
        );
      });
    }

    // อัพเดท netAmount ใน credit
    const finalAmount = amount + credit_promotion;

    // เช็คว่าเป็น admin เติมเงินหรือไม่
    const isAdminTopup =
      addcredit_admin_id && addcredit_admin_name && addcredit_admin_role;

    // คำนวณค่าคอมมิชชั่นเฉพาะกรณี admin เติมเงิน (success ทันที)
    let commissionData = null;
    if (isAdminTopup) {
      commissionData = await commissionService.calculateCommission(
        user._id,
        finalAmount,
        "deposit",
      );
    }

    const newCredit = new Credit({
      user_id: user._id,
      master_id: commissionData ? commissionData.master_id : null,
      promotion_id: promotion_id,
      amount,
      credit_promotion: credit_promotion,
      netAmount: finalAmount,
      fee: 0,

      // ข้อมูลค่าคอมมิชชั่น - จะคำนวณตอนอนุมัติ (ยกเว้น admin topup)
      commission_percentage: commissionData
        ? commissionData.commission_percentage
        : 0,
      commission_amount: commissionData ? commissionData.commission_amount : 0,
      system_profit: commissionData ? commissionData.system_profit : 0,

      channel,
      description,
      slip_image,
      slip_image_original_name,
      status: isAdminTopup ? "success" : "pending", // admin เติม = success ทันที, user ฝาก = pending
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ดู token ที่ middle ส่งมา
    if (isAdminTopup) {
      newCredit.addcredit_admin_id = addcredit_admin_id;
      newCredit.addcredit_admin_name = addcredit_admin_name;
      newCredit.addcredit_admin_role = addcredit_admin_role;
    }
    // บันทึกข้อมูล
    await newCredit.save();

    // ถ้าเป็น admin เติมเงิน ให้เพิ่มเครดิตทันที
    if (isAdminTopup) {
      // บันทึก transaction
      const userTransaction = new UserTransaction({
        user_id: user._id,
        type: "deposit",
        amount: finalAmount,
        balance_before: user.credit,
        balance_after: user.credit + finalAmount,
        ref_id: newCredit._id,
        ref_model: "Credit",
        description:
          description ||
          `Admin ${addcredit_admin_name} เติมเงินผ่าน ${channel}${credit_promotion > 0 ? ` + โบนัส ${credit_promotion}` : ""}`,
        created_at: new Date(),
      });
      await userTransaction.save();

      //ทำการเพิ่ม credit ให้กับ user (รวม promotion แล้ว)
      user.credit += finalAmount;
      await user.save();

      // อัพเดท MasterCommission (ถ้ามี master และคำนวณ commission แล้ว)
      if (commissionData && commissionData.master_id) {
        await commissionService.updateCommissionOnDeposit({
          user_id: user._id,
          master_id: commissionData.master_id,
          netAmount: finalAmount,
          commission_amount: commissionData.commission_amount,
          system_profit: commissionData.system_profit,
        });
      }
    }

    return newCredit;
  } catch (error) {
    // ถ้า error ให้ลบไฟล์ที่ upload ไว้
    if (slip_image) {
      deleteFile(slip_image);
    }
    throw error;
  }
};

//แก้ไข
exports.updateCredit = async function ({ id, amount, channel, description }) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    // อัพเดทข้อมูล
    credit.amount = amount || credit.amount;
    credit.channel = channel || credit.channel;
    credit.description = description || credit.description;
    credit.updated_at = new Date();

    await credit.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// อนุมัติ
exports.approveCredit = async function ({ id }) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    if (credit.status === "success") {
      throw new Error("credit นี้ถูกอนุมัติไปแล้ว");
    }

    if (credit.status !== "pending") {
      throw new Error("ไม่สามารถอนุมัติได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // เพิ่ม credit ให้กับ user
    const user = await User.findById(credit.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    // คำนวณค่าคอมมิชชั่นตอนอนุมัติ
    const commissionData = await commissionService.calculateCommission(
      user._id,
      credit.netAmount,
      "deposit",
    );

    // อัพเดทข้อมูลค่าคอมมิชชั่นใน credit
    credit.master_id = commissionData.master_id;
    credit.commission_percentage = commissionData.commission_percentage;
    credit.commission_amount = commissionData.commission_amount;
    credit.system_profit = commissionData.system_profit;

    // บันทึก transaction
    const userTransaction = new UserTransaction({
      user_id: user._id,
      type: "deposit",
      amount: credit.netAmount,
      balance_before: user.credit,
      balance_after: user.credit + credit.netAmount,
      ref_id: credit._id,
      ref_model: "Credit",
      description:
        credit.description ||
        `เติมเงินผ่าน ${credit.channel}${credit.credit_promotion > 0 ? ` + โบนัส ${credit.credit_promotion}` : ""}`,
      created_at: new Date(),
    });
    await userTransaction.save();

    // เพิ่มเครดิตให้ user
    user.credit += credit.netAmount;
    await user.save();

    // อัพเดท MasterCommission (ถ้ามี master)
    if (commissionData.master_id) {
      await commissionService.updateCommissionOnDeposit({
        user_id: user._id,
        master_id: commissionData.master_id,
        netAmount: credit.netAmount,
        commission_amount: commissionData.commission_amount,
        system_profit: commissionData.system_profit,
      });
    }

    // อัพเดทสถานะเป็น success
    credit.status = "success";
    credit.updated_at = new Date();
    await credit.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// ยกเลิก
exports.cancelCredit = async function ({ id }) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    if (credit.status === "failed") {
      throw new Error("credit นี้ถูกยกเลิกไปแล้ว");
    }

    // ถ้าสถานะเป็น success ให้คืน credit กลับ
    if (credit.status === "success") {
      const user = await User.findById(credit.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      // ลบ transaction ที่เกี่ยวข้อง
      await UserTransaction.deleteOne({ ref_id: credit._id, type: "deposit" });

      // หักเครดิตคืน
      user.credit -= credit.netAmount;
      await user.save();
    }

    // อัพเดทสถานะเป็น failed
    credit.status = "failed";
    credit.updated_at = new Date();
    await credit.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// ดึงตาม id
exports.getCreditById = async function (id) {
  return await Credit.findOne({ _id: id }).populate("promotion_id");
};

// ดึงทั้งหมด
exports.getAllCredits = async function ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
} = {}) {
  const skip = (page - 1) * limit;

  // สร้างเงื่อนไขการค้นหา
  let dateFilter = {};

  if (startDate && endDate) {
    // ค้นหาระหว่างวันที่
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");
    dateFilter.created_at = {
      $gte: start,
      $lte: end,
    };
  } else if (startDate) {
    // ค้นหาวันเดียว
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(startDate + "T23:59:59.999Z");
    dateFilter.created_at = {
      $gte: start,
      $lte: end,
    };
  }

  const credits = await Credit.find(dateFilter)
    .populate("promotion_id")
    .populate("user_id")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Credit.countDocuments(dateFilter);

  return {
    data: credits,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ดึงประวัติการเติมเงินตาม user id
exports.getCreditsByUserId = async function (
  user_id,
  { page = 1, limit = 10, status } = {},
) {
  try {
    const skip = (page - 1) * limit;

    // สร้าง query object
    console.log(user_id);
    let query = { user_id };
    if (status) {
      query.status = status;
    }

    const credits = await Credit.find(query)
      .populate("promotion_id")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Credit.countDocuments(query);

    return {
      data: credits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// ลบการเติมเงิน
exports.deleteCredit = async function ({ id }) {
  try {
    const credit = await Credit.findById(id).populate("promotion_id");
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    // ลบไฟล์รูปสลิป (ถ้ามี)
    if (credit.slip_image) {
      deleteFile(credit.slip_image);
    }

    // ถ้าสถานะเป็น success ให้หักเงินคืนจาก user
    if (credit.status === "success") {
      const user = await User.findById(credit.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      user.credit -= credit.netAmount;
      await user.save();
    }

    // ลบ transaction ที่เกี่ยวข้อง
    await UserTransaction.deleteOne({ ref_id: credit._id, type: "deposit" });

    // ลบข้อมูล credit
    await Credit.findByIdAndDelete(id);

    return { message: "ลบข้อมูล credit สำเร็จ" };
  } catch (error) {
    throw error;
  }
};

exports.getCreditStatsByUserId = async function (user_id) {
  try {
    if (!Types.ObjectId.isValid(user_id)) {
      throw new Error("Invalid user ID");
    }

    const results = await Credit.aggregate([
      {
        $match: {
          user_id: new Types.ObjectId(String(user_id)),
        },
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (results.length === 0) {
      return { count: 0, total_amount: 0 };
    }

    return {
      count: results[0].count,
      total_amount: results[0].total_amount,
    };
  } catch (error) {
    console.error("Error in getCreditStatsByUserId:", error.message);
    throw new Error("Failed to get credit stats");
  }
};

exports.getUniqueTopupDays = async function (user_id, promotion_id) {
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new Error("Invalid user_id");
  }
  if (!mongoose.Types.ObjectId.isValid(promotion_id)) {
    throw new Error("Invalid promotion_id");
  }

  const userIdObj = new mongoose.Types.ObjectId(user_id);
  const promotionIdObj = new mongoose.Types.ObjectId(promotion_id);

  const creditCount = await Credit.aggregate([
    {
      $match: {
        user_id: userIdObj,
        promotion_id: promotionIdObj,
        type: "topup",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
      },
    },
    {
      $count: "uniqueDays",
    },
  ]);

  const uniqueDaysCount = creditCount[0]?.uniqueDays || 0;
  return uniqueDaysCount;
};

// ฟังก์ชั่นตรวจสอบความเหมาะสมของผู้ใช้กับโปรโมชั่น
function isUserEligibleForPromotion(user, promotion) {
  // ตรวจสอบ target ของโปรโมชั่น
  const promotionTarget = promotion.target;

  // ตรวจสอบสิทธิ์ของผู้ใช้
  const userTargets = getUserTargets(user);

  // เช็คว่า target ของโปรอยู่ในสิทธิ์ของผู้ใช้หรือไม่
  if (userTargets.includes(promotionTarget)) {
    return true;
  }

  // ตรวจสอบ target "specific" แยกต่างหาก
  if (promotionTarget === "specific") {
    return (
      promotion.specificUsers &&
      promotion.specificUsers.some(id => id.equals(user._id))
    );
  }

  return false;
}

// ฟังก์ชั่นดึง target ทั้งหมดของผู้ใช้
function getUserTargets(user) {
  const targets = [];

  // เพิ่ม target ตามสถานะของผู้ใช้
  if (user.master_id) {
    targets.push("master"); // คนที่สมัครกับ master
  }

  if (user.referral_user_id) {
    targets.push("referrer"); // คนที่สมัครผ่านเพื่อน (referee)
  }

  if (!user.master_id && !user.referral_user_id) {
    targets.push("normal"); // คนที่สมัครเองโดยไม่ผ่านใคร
  }

  // 'all' เป็นสิทธิ์พิเศษที่ทุกคนมี
  targets.push("all");

  return targets;
}

async function updateUserPromotionProgress(
  user_id,
  promotionId,
  depositAmount,
) {
  try {
    let userPromo = await UserPromotion.findOne({ user_id, promotionId });
    console.log(
      "🔍 Checking UserPromotion for user:",
      user_id,
      "and promotion:",
      promotionId,
    );

    if (!userPromo) {
      userPromo = new UserPromotion({
        user_id,
        promotionId,
        status: "pending",
        progress: {
          depositCount: 1,
          depositTotal: depositAmount,
          betTotal: 0,
          lossTotal: 0,
          lastDepositDate: new Date(),
          consecutiveDays: 1,
        },
        reward: {
          amount: 0,
          withdrawable: false,
        },
      });
    } else {
      userPromo.progress.depositCount += 1;
      userPromo.progress.depositTotal += depositAmount;
      userPromo.progress.lastDepositDate = new Date();
    }

    userPromo.updatedAt = new Date();
    await userPromo.save();
    console.log("UserPromotion updated:", userPromo);
  } catch (error) {
    console.error("Failed to update user promotion progress:", error);
    throw error;
  }
}

// ฟังก์ชั่นจัดการ daily-deposit promotion
async function handleDailyDepositPromotion(
  user,
  userPromotion,
  promotion,
  amount,
) {
  const conditions = promotion.conditions;
  const depositAmount = conditions.depositAmount;
  const depositDays = conditions.depositDays;
  const maxBonusAmount = conditions.maxBonusAmount;
  const maxDepositCountPerDay = conditions.maxDepositCountPerDay;

  if (amount < depositAmount) {
    return { credit_promotion: 0, promotion_id: null };
  }

  // เช็คว่ามี promotions array หรือไม่
  if (!userPromotion.promotions || !Array.isArray(userPromotion.promotions)) {
    userPromotion.promotions = [];
  }

  let check_promotion = userPromotion.promotions.find(p =>
    p.promotion_id.equals(promotion._id),
  );
  const today = new Date();

  if (check_promotion) {
    // มีโปรนี้อยู่แล้ว เช็คเงื่อนไขต่อ

    // เช็คว่าได้รับโบนัสไปแล้วหรือยัง
    if (check_promotion.status === "completed") {
      console.log(
        `🚫 Daily deposit promotion ${promotion._id} already completed for user ${user._id}`,
      );
      return { credit_promotion: 0, promotion_id: null };
    }

    console.log(
      `📝 Processing existing daily deposit promotion ${promotion._id} for user ${user._id}, status: ${check_promotion.status}`,
    );

    const todayStr = moment(today).format("YYYY-MM-DD");
    const lastDepositStr = check_promotion.progress.lastDepositDate
      ? moment(check_promotion.progress.lastDepositDate).format("YYYY-MM-DD")
      : null;

    // เช็คว่าฝากวันนี้แล้วหรือยัง
    if (lastDepositStr === todayStr) {
      // ฝากวันนี้แล้ว เช็คจำนวนครั้งต่อวัน
      if (
        maxDepositCountPerDay > 0 &&
        check_promotion.progress.depositCount >= maxDepositCountPerDay
      ) {
        return { credit_promotion: 0, promotion_id: null };
      }
    }

    // อัพเดทข้อมูลการฝาก
    check_promotion.progress.depositCount += 1;
    check_promotion.progress.depositTotal += amount;
    check_promotion.progress.lastDepositDate = today;
    check_promotion.updatedAt = today;

    // เช็คว่าครบเงื่อนไขหรือยัง
    if (check_promotion.progress.depositCount >= depositDays) {
      if (check_promotion.status === "pending") {
        check_promotion.status = "completed";

        const rewards = promotion.rewards;
        if (!rewards) {
          console.log("ไม่พบ reward ใน promotion:", promotion._id);
          return { credit_promotion: 0, promotion_id: null };
        }

        const rewardType = rewards.type || "percentage";
        const rewardAmount = rewards.amount || 10;
        const rewardBasedOn = rewards.basedOn || "deposit";

        let finalRewardAmount = 0;

        if (rewardType === "percentage") {
          if (rewardBasedOn === "deposit") {
            finalRewardAmount =
              (check_promotion.progress.depositTotal * rewardAmount) / 100;
          } else if (rewardBasedOn === "amount") {
            finalRewardAmount = (amount * rewardAmount) / 100;
          }
        } else if (rewardType === "fixed") {
          finalRewardAmount = rewardAmount;
        }

        if (
          maxBonusAmount &&
          maxBonusAmount > 0 &&
          finalRewardAmount > maxBonusAmount
        ) {
          finalRewardAmount = maxBonusAmount;
        }

        check_promotion.reward.amount = finalRewardAmount;
        check_promotion.reward.withdrawable = rewards.withdrawable || false;
        check_promotion.reward.givenAt = today;

        console.log(
          `✅ Daily deposit bonus given: ${finalRewardAmount} for promotion ${promotion._id}, user ${user._id}`,
        );

        // บอก Mongoose ว่ามีการเปลี่ยนแปลงใน promotions array
        userPromotion.markModified("promotions");

        // บันทึกการเปลี่ยนแปลงลงฐานข้อมูลทันที
        await userPromotion.save();
        console.log(
          `💾 Daily deposit status updated to 'completed' for promotion ${promotion._id}, user ${user._id}`,
        );

        return {
          credit_promotion: finalRewardAmount,
          promotion_id: promotion._id,
        };
      }
    }
  } else {
    // ยังไม่มีโปรนี้ สร้างใหม่
    const newUserPromotionItem = {
      promotion_id: promotion._id,
      status: "pending",
      progress: {
        depositCount: 1,
        depositTotal: amount,
        betTotal: 0,
        lossTotal: 0,
        lastDepositDate: today,
        consecutiveDays: 1,
      },
      reward: {
        amount: 0,
        withdrawable: false,
      },
      createdAt: today,
      updatedAt: today,
    };

    userPromotion.promotions.push(newUserPromotionItem);
  }

  return { credit_promotion: 0, promotion_id: promotion._id };
}

// ฟังก์ชั่นจัดการ instant-bonus promotion
async function handleInstantBonusPromotion(
  user,
  userPromotion,
  promotion,
  amount,
) {
  const conditions = promotion.conditions;
  const depositAmount = conditions.depositAmount;
  const maxBonusAmount = conditions.maxBonusAmount;
  const maxDepositCountPerDay = conditions.maxDepositCountPerDay;

  if (amount < depositAmount) {
    return { credit_promotion: 0, promotion_id: null };
  }

  // เช็คว่ามี promotions array หรือไม่
  if (!userPromotion.promotions || !Array.isArray(userPromotion.promotions)) {
    userPromotion.promotions = [];
  }

  let check_promotion = userPromotion.promotions.find(p =>
    p.promotion_id.equals(promotion._id),
  );
  const today = new Date();

  if (check_promotion) {
    // มีโปรนี้อยู่แล้ว เช็คเงื่อนไขต่อ

    // เช็คว่าได้รับโบนัสไปแล้วหรือยัง
    if (check_promotion.status === "completed") {
      console.log(
        `🚫 Promotion ${promotion._id} already completed for user ${user._id}`,
      );
      return { credit_promotion: 0, promotion_id: null };
    }

    console.log(
      `📝 Processing existing promotion ${promotion._id} for user ${user._id}, status: ${check_promotion.status}`,
    );

    const todayStr = moment(today).format("YYYY-MM-DD");
    const lastDepositStr = check_promotion.progress.lastDepositDate
      ? moment(check_promotion.progress.lastDepositDate).format("YYYY-MM-DD")
      : null;

    // เช็คว่าฝากวันนี้แล้วหรือยัง
    if (lastDepositStr === todayStr) {
      // ฝากวันนี้แล้ว เช็คจำนวนครั้งต่อวัน
      if (
        maxDepositCountPerDay > 0 &&
        check_promotion.progress.depositCount >= maxDepositCountPerDay
      ) {
        return { credit_promotion: 0, promotion_id: null };
      }
    }

    // อัพเดทข้อมูลการฝาก
    check_promotion.progress.depositCount += 1;
    check_promotion.progress.depositTotal += amount;
    check_promotion.progress.lastDepositDate = today;
    check_promotion.updatedAt = today;
  } else {
    // ยังไม่มีโปรนี้ สร้างใหม่
    const newUserPromotionItem = {
      promotion_id: promotion._id,
      status: "pending",
      progress: {
        depositCount: 1,
        depositTotal: amount,
        betTotal: 0,
        lossTotal: 0,
        lastDepositDate: today,
        consecutiveDays: 1,
      },
      reward: {
        amount: 0,
        withdrawable: false,
      },
      createdAt: today,
      updatedAt: today,
    };

    userPromotion.promotions.push(newUserPromotionItem);

    // บอก Mongoose ว่ามีการเปลี่ยนแปลงใน promotions array
    userPromotion.markModified("promotions");
    await userPromotion.save();

    check_promotion = userPromotion.promotions.find(p =>
      p.promotion_id.equals(promotion._id),
    );
    console.log(
      `🆕 Created new promotion ${promotion._id} for user ${user._id}`,
    );
  }

  // คำนวณโบนัสทันที
  const rewards = promotion.rewards;
  if (rewards) {
    const rewardType = rewards.type || "fixed";
    const rewardAmount = rewards.amount || 0;
    const rewardBasedOn = rewards.basedOn || "deposit";

    let finalRewardAmount = 0;

    if (rewardType === "percentage") {
      if (rewardBasedOn === "deposit") {
        finalRewardAmount = (amount * rewardAmount) / 100;
      } else if (rewardBasedOn === "amount") {
        finalRewardAmount = (amount * rewardAmount) / 100;
      }
    } else if (rewardType === "fixed") {
      finalRewardAmount = rewardAmount;
    }

    if (
      maxBonusAmount &&
      maxBonusAmount > 0 &&
      finalRewardAmount > maxBonusAmount
    ) {
      finalRewardAmount = maxBonusAmount;
    }

    // อัพเดทข้อมูล reward ใน userPromotion
    if (check_promotion) {
      console.log(
        `📊 Before update - Status: ${check_promotion.status}, Reward: ${check_promotion.reward.amount}`,
      );

      check_promotion.reward.amount = finalRewardAmount;
      check_promotion.reward.withdrawable = rewards.withdrawable || false;
      check_promotion.reward.givenAt = today;
      check_promotion.status = "completed";

      // บอก Mongoose ว่ามีการเปลี่ยนแปลงใน promotions array
      userPromotion.markModified("promotions");

      console.log(
        `✅ Instant bonus given: ${finalRewardAmount} for promotion ${promotion._id}, user ${user._id}`,
      );

      // บันทึกการเปลี่ยนแปลงลงฐานข้อมูลทันที
      await userPromotion.save();
      console.log(
        `💾 Status updated to 'completed' for promotion ${promotion._id}, user ${user._id}`,
      );
    }

    return {
      credit_promotion: finalRewardAmount,
      promotion_id: promotion._id,
    };
  }

  return { credit_promotion: 0, promotion_id: promotion._id };
}

// ฟังก์ชั่นจัดการ turnover-bonus promotion
async function handleTurnoverBonusPromotion(
  user,
  userPromotion,
  promotion,
  amount,
) {
  // รอก่อน - ยังไม่ได้ implement
  return { credit_promotion: 0, promotion_id: null };
}

// ฟังก์ชั่นตรวจสอบโปรที่มีอยู่
async function checkExistingPromotions(
  user,
  userPromotion,
  eligiblePromotions,
  amount,
) {
  if (
    !userPromotion.promotions ||
    !Array.isArray(userPromotion.promotions) ||
    userPromotion.promotions.length === 0
  ) {
    return {
      foundActivePromotion: false,
      credit_promotion: 0,
      promotion_id: null,
    };
  }

  for (const userPromo of userPromotion.promotions) {
    // ตรวจสอบทั้ง pending และ completed status
    if (userPromo.status === "pending" || userPromo.status === "completed") {
      const matchingPromotion = eligiblePromotions.find(p =>
        p._id.equals(userPromo.promotion_id),
      );
      if (matchingPromotion) {
        console.log(
          `🔍 Checking existing promotion ${userPromo.promotion_id} for user ${user._id}, status: ${userPromo.status}`,
        );

        let result = { credit_promotion: 0, promotion_id: null };

        switch (matchingPromotion.type) {
          case "daily-deposit":
            result = await handleDailyDepositPromotion(
              user,
              userPromotion,
              matchingPromotion,
              amount,
            );
            break;
          case "instant-bonus":
            result = await handleInstantBonusPromotion(
              user,
              userPromotion,
              matchingPromotion,
              amount,
            );
            break;
          case "turnover-bonus":
            result = await handleTurnoverBonusPromotion(
              user,
              userPromotion,
              matchingPromotion,
              amount,
            );
            break;
        }

        if (result.credit_promotion > 0) {
          return { foundActivePromotion: true, ...result };
        }
      }
    }
  }

  return {
    foundActivePromotion: false,
    credit_promotion: 0,
    promotion_id: null,
  };
}

// ฟังก์ชั่นตรวจสอบโปรใหม่
async function checkNewPromotions(
  user,
  userPromotion,
  eligiblePromotions,
  amount,
) {
  for (const promotion of eligiblePromotions) {
    // เช็คว่าโปรนี้มีอยู่ใน userPromotion และได้รับโบนัสไปแล้วหรือยัง
    const existingUserPromo = userPromotion.promotions.find(p =>
      p.promotion_id.equals(promotion._id),
    );
    if (existingUserPromo && existingUserPromo.status === "completed") {
      console.log(
        `🚫 Skipping completed promotion ${promotion._id} for user ${user._id}`,
      );
      continue; // ข้ามโปรที่ได้รับโบนัสไปแล้ว
    }

    console.log(
      `🔍 Checking new promotion ${promotion._id} for user ${user._id}`,
    );

    let result = { credit_promotion: 0, promotion_id: null };

    switch (promotion.type) {
      case "daily-deposit":
        result = await handleDailyDepositPromotion(
          user,
          userPromotion,
          promotion,
          amount,
        );
        break;
      case "instant-bonus":
        result = await handleInstantBonusPromotion(
          user,
          userPromotion,
          promotion,
          amount,
        );
        break;
      case "turnover-bonus":
        result = await handleTurnoverBonusPromotion(
          user,
          userPromotion,
          promotion,
          amount,
        );
        break;
    }

    if (result.credit_promotion > 0) {
      return result;
    }
  }

  return { credit_promotion: 0, promotion_id: null };
}

// ดึงประวัติ transaction ตาม user_id
exports.getUserTransactions = async function (
  user_id,
  { page = 1, limit = 10, type, startDate, endDate } = {},
) {
  try {
    const skip = (page - 1) * limit;

    // สร้าง query object
    let query = { user_id };

    // เพิ่มเงื่อนไขการค้นหาตาม type ถ้ามีการระบุ
    if (type) {
      query.type = type;
    }

    // เพิ่มเงื่อนไขการค้นหาตามช่วงวันที่
    if (startDate || endDate) {
      query.created_at = {};

      if (startDate) {
        query.created_at.$gte = new Date(startDate + "T00:00:00.000Z");
      }

      if (endDate) {
        query.created_at.$lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // ดึงข้อมูล transaction
    const transactions = await UserTransaction.find(query)
      .sort({ created_at: -1 }) // เรียงจากใหม่ไปเก่า
      .skip(skip)
      .limit(limit)
      .populate({
        path: "ref_id",
        refPath: "ref_model",
      })
      .populate("user_id", "username phone"); // เพิ่มข้อมูล user

    // นับจำนวนทั้งหมด
    const total = await UserTransaction.countDocuments(query);

    // คำนวณยอดรวมของแต่ละประเภท transaction
    const summary = await UserTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // แยกสรุปตาม ref_model
    const modelSummary = await UserTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$ref_model",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      data: transactions,
      summary,
      modelSummary,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getUserTransactions:", error.message);
    throw new Error("ไม่สามารถดึงข้อมูล transaction ได้");
  }
};
