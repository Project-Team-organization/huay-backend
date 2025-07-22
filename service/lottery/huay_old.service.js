const huay = require("../../models/huay.model");
const UserBet = require("../../models/userBetSchema.models");

exports.evaluateUserBetsByLotterySet = async function (lottery_set_id) {
  try {
    if (!lottery_set_id) {
      throw new Error("ต้องระบุ lottery_set_id");
    }

    // 1. รวบรวมเลขถูกรางวัลทั้งหมดในงวดนี้
    const huayResults = await huay.find({ lottery_set_id });

    if (!huayResults || huayResults.length === 0) {
      throw new Error("ไม่พบผลรางวัลของงวดนี้");
    }

    const winningNumbers = huayResults.flatMap((h) => h.huay_number || []);
    console.log(`📌 ตรวจงวด: ${lottery_set_id}`);
    console.log(`🏆 เลขที่ถูกรางวัลรวม: ${JSON.stringify(winningNumbers)}`);

    // 2. หาผู้ใช้ที่ยังไม่ถูกตรวจ
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    console.log(`📦 พบผู้ใช้ที่ยังไม่ตรวจ: ${pendingBets.length} คน`);

    const updatedBets = [];

    for (const userBet of pendingBets) {
      let hasWon = false;
      let payoutAmount = 0;

      console.log(`👤 ตรวจ user: ${userBet.user_id}`);

      for (const bet of userBet.bets) {
        for (const numObj of bet.numbers) {
          const userNumber = numObj.number;
          const amount = numObj.amount;
          const rate = bet.payout_rate;

          const isWin = winningNumbers.includes(userNumber);

          console.log(
            `➡️ แทงเลข: ${userNumber}, จำนวน: ${amount}, อัตรา: ${rate} | ${
              isWin ? "✅ ถูก" : "❌ ไม่ถูก"
            }`
          );

          if (isWin) {
            hasWon = true;
            payoutAmount += amount * rate;
          }
        }
      }

      userBet.status = hasWon ? "won" : "lost";
      userBet.payout_amount = payoutAmount;
      userBet.updated_at = new Date();
      await userBet.save();

      console.log(
        `🎯 ผล: ${userBet.status.toUpperCase()}, รับเงิน: ${payoutAmount}`
      );

      updatedBets.push(userBet);
    }

    console.log(`\n✅ ตรวจเสร็จทั้งหมด ${updatedBets.length} รายการ`);
    return updatedBets;
  } catch (error) {
    console.error("❌ evaluateUserBetsByLotterySet error:", error.message);
    throw error;
  }
}; 