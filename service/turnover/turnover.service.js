const mongoose = require("mongoose");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");
const Promotion = require("../../models/promotion.model");
const UserTransaction = require("../../models/user.transection.model");

/**
 * คำนวณสถานะยอดเทิร์นโอเวอร์ของผู้ใช้งาน
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<Object>}
 */
exports.calculateUserTurnover = async function (userId) {
  try {
    if (!userId) {
      return {
        canWithdraw: true,
        hasActivePromo: false,
        isTurnoverMet: true,
        requiredTurnover: 0,
        currentTurnover: 0,
        remainingTurnover: 0,
        percentage: 100,
      };
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // ดึงโปรโมชั่นของผู้ใช้
    const userPromotion = await UserPromotion.findOne({ user_id: userObjId }).populate("promotions.promotion_id");
    if (!userPromotion || !Array.isArray(userPromotion.promotions) || userPromotion.promotions.length === 0) {
      return {
        canWithdraw: true,
        hasActivePromo: false,
        isTurnoverMet: true,
        requiredTurnover: 0,
        currentTurnover: 0,
        remainingTurnover: 0,
        percentage: 100,
      };
    }

    // หาโปรโมชั่นล่าสุดที่ได้รับรางวัลแล้ว และยังต้องทำเทิร์น (withdrawable !== true และ turnoverCompleted !== true)
    const activePromoItem = userPromotion.promotions
      .filter((p) => {
        const hasReward = p.reward && p.reward.amount > 0 && p.reward.givenAt;
        const notCompleted = !p.reward?.turnoverCompleted;
        const notWithdrawable = p.reward?.withdrawable === false;
        const promoDef = p.promotion_id;
        const hasTurnoverCondition = promoDef && promoDef.conditions && (promoDef.conditions.turnOverTimes > 0);
        return hasReward && notCompleted && notWithdrawable && hasTurnoverCondition;
      })
      .sort((a, b) => new Date(b.reward?.givenAt || b.createdAt) - new Date(a.reward?.givenAt || a.createdAt))[0];

    if (!activePromoItem) {
      return {
        canWithdraw: true,
        hasActivePromo: false,
        isTurnoverMet: true,
        requiredTurnover: 0,
        currentTurnover: 0,
        remainingTurnover: 0,
        percentage: 100,
      };
    }

    const promoDef = activePromoItem.promotion_id;
    const turnOverTimes = promoDef.conditions?.turnOverTimes || 1;
    const depositAmount = activePromoItem.progress?.depositTotal || promoDef.conditions?.depositAmount || 0;
    const bonusAmount = activePromoItem.reward?.amount || 0;

    // ยอดเทิร์นที่ต้องทำ: (ยอดฝาก + โบนัส) * เท่าของเทิร์น
    const requiredTurnover = Number(((depositAmount + bonusAmount) * turnOverTimes).toFixed(2));

    // วันที่เริ่มนับเทิร์น (วันที่ได้รับโบนัส)
    const startDate = activePromoItem.reward?.givenAt || activePromoItem.createdAt || new Date(0);

    // รวมยอดแทงทั้งหมดตั้งแต่ได้รับโบนัส (ทั้งหวยและเกม)
    const betAgg = await UserTransaction.aggregate([
      {
        $match: {
          user_id: userObjId,
          type: "bet",
          status: { $ne: "CANCEL" },
          created_at: { $gte: new Date(startDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalBet: { $sum: "$amount" },
        },
      },
    ]);

    const currentTurnover = Number((betAgg[0]?.totalBet || 0).toFixed(2));
    const isTurnoverMet = currentTurnover >= requiredTurnover;
    const remainingTurnover = isTurnoverMet ? 0 : Number((requiredTurnover - currentTurnover).toFixed(2));
    const percentage = requiredTurnover > 0 
      ? Math.min(100, Number(((currentTurnover / requiredTurnover) * 100).toFixed(1)))
      : 100;

    // ถ้าทำเทิร์นครบแล้ว อัปเดตสถานะ turnoverCompleted = true เพื่อไม่ให้ติดเงื่อนไขในอนาคต
    if (isTurnoverMet && !activePromoItem.reward?.turnoverCompleted) {
      activePromoItem.reward.turnoverCompleted = true;
      activePromoItem.progress.betTotal = currentTurnover;
      userPromotion.markModified("promotions");
      await userPromotion.save().catch((err) => console.error("Error saving userPromotion turnoverCompleted:", err));
    }

    return {
      canWithdraw: isTurnoverMet,
      hasActivePromo: true,
      isTurnoverMet,
      promotionId: promoDef._id,
      promotionName: promoDef.name || "โปรโมชั่น",
      turnOverTimes,
      depositAmount,
      bonusAmount,
      requiredTurnover,
      currentTurnover,
      remainingTurnover,
      percentage,
      startDate,
    };
  } catch (error) {
    console.error("❌ calculateUserTurnover error:", error.message);
    return {
      canWithdraw: true,
      hasActivePromo: false,
      isTurnoverMet: true,
      requiredTurnover: 0,
      currentTurnover: 0,
      remainingTurnover: 0,
      percentage: 100,
    };
  }
};

/**
 * บันทึกความคืบหน้าการเดิมพัน (ทั้งหวยและเกม)
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {number} betAmount
 */
exports.recordBetProgress = async function (userId, betAmount) {
  try {
    if (!userId || !betAmount || betAmount <= 0) return;

    const userObjId = new mongoose.Types.ObjectId(userId);
    const userPromotion = await UserPromotion.findOne({ user_id: userObjId });
    if (!userPromotion || !Array.isArray(userPromotion.promotions) || userPromotion.promotions.length === 0) return;

    // หาโปรโมชั่นที่ยังไม่ผ่านเทิร์น
    const activePromo = userPromotion.promotions.find(
      (p) => p.reward && p.reward.amount > 0 && p.reward.withdrawable === false && !p.reward.turnoverCompleted
    );

    if (activePromo) {
      activePromo.progress.betTotal = Number(((activePromo.progress.betTotal || 0) + betAmount).toFixed(2));
      userPromotion.markModified("promotions");
      await userPromotion.save();
    }
  } catch (error) {
    console.error("❌ recordBetProgress error:", error.message);
  }
};
