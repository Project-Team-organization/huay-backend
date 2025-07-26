const huay = require("../../models/huay.model");
const LotterySets = require("../../models/lotterySets.model");
const UserBet = require("../../models/userBetSchema.models");
const LotteryResult = require("../../models/lottery_results.model");
const LotteryResultItem = require("../../models/lottery_result_items.model");
const LotteryWinner = require("../../models/lottery_winners.model");
const LotteryType = require("../../models/lotteryType.model");
const User = require("../../models/user.model");
const UserTransection = require("../../models/user.transection.model");
const LotteryLimitedNumbers = require("../../models/lottery_limited_numbers.model");
const { default: mongoose } = require("mongoose");
const fetch = require("node-fetch");

exports.create = async (data, lottery_set_id) => {
  try {
    const set = await LotterySets.findById(lottery_set_id);
    if (!set) {
      throw new Error("Invalid lottery_set_id : set not found.");
    }

    let result;

    if (Array.isArray(data)) {
      result = await huay.insertMany(data);
    } else {
      result = await huay.create(data);
    }

    return result;
  } catch (error) {
    console.error("Failed to insert Huay data:", error.message);
    throw new Error("Error inserting Huay data: " + error.message);
  }
};

exports.getHuay = async (lottery_set_id) => {
  try {
    if (!lottery_set_id) {
      throw new Error("lottery_set_id is required.");
    }

    const huayData = await huay.find({ lottery_set_id });
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data:", error.message);
    throw new Error("Error retrieving Huay data: " + error.message);
  }
};

exports.getHuayById = async (huayId) => {
  try {
    const huayData = await huay.findById(huayId);
    if (!huayData) {
      throw new Error("Huay data not found.");
    }
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data by ID:", error.message);
    throw new Error("Error retrieving Huay data by ID: " + error.message);
  }
};

exports.updateHuay = async (huayId, data) => {
  try {
    const updatedHuay = await huay.findByIdAndUpdate(huayId, data, {
      new: true,
    });
    return updatedHuay;
  } catch (error) {
    console.error("Failed to update Huay data:", error.message);
    throw new Error("Error updating Huay data: " + error.message);
  }
};

// ฟังก์ชันสำหรับแสดงผลรางวัลหวย
exports.printLotteryResults = async function () {
  try {
    // เรียก API
    const response = await fetch("https://lotto.api.rayriffy.com/latest");
    const lotteryData = await response.json();

    // ฟังก์ชันสำหรับดึงข้อมูลรางวัลที่ 1
    const getFirstPrize = () => {
      const first = lotteryData.response.prizes.find(
        (p) => p.id === "prizeFirst"
      );
      return first.number[0]; // เช่น "123456"
    };

    // ฟังก์ชันสำหรับดึงเลขหน้า 3 ตัว
    const getFrontThreeDigits = () => {
      const front = lotteryData.response.runningNumbers.find(
        (r) => r.id === "runningNumberFrontThree"
      );
      return front.number; // เช่น ["123", "456"]
    };

    // ฟังก์ชันสำหรับดึงเลขท้าย 3 ตัว
    const getBackThreeDigits = () => {
      const back = lotteryData.response.runningNumbers.find(
        (r) => r.id === "runningNumberBackThree"
      );
      return back.number; // เช่น ["789", "012"]
    };

    // ฟังก์ชันสำหรับดึงเลขท้าย 2 ตัว
    const getBackTwoDigits = () => {
      const back = lotteryData.response.runningNumbers.find(
        (r) => r.id === "runningNumberBackTwo"
      );
      return back.number[0]; // เช่น "56"
    };

    // เก็บผลรางวัลทั้งหมดไว้ในตัวแปร
    const prizeResults = {
      firstPrize: getFirstPrize(),
      frontThreeDigits: getFrontThreeDigits(),
      backThreeDigits: getBackThreeDigits(),
      backTwoDigits: getBackTwoDigits(),
      date: lotteryData.response.date,
    };

    // แสดงผลรางวัลทั้งหมดที่เก็บไว้
    console.log("\n🎯 ผลการออกรางวัลหวย 🎯");
    console.log(`📅 งวดวันที่: ${prizeResults.date}\n`);
    console.log("🏆 ผลรางวัลที่จะใช้ตรวจ:");
    console.log(`รางวัลที่ 1: ${prizeResults.firstPrize}`);
    console.log(`เลขหน้า 3 ตัว: ${prizeResults.frontThreeDigits.join(", ")}`);
    console.log(`เลขท้าย 3 ตัว: ${prizeResults.backThreeDigits.join(", ")}`);
    console.log(`เลขท้าย 2 ตัว: ${prizeResults.backTwoDigits}\n`);

    return prizeResults;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลหวย:", error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับสร้างรายการรางวัล
const createLotteryResultItems = async (
  lottery_type,
  huayResults,
  lotteryResult
) => {
  const resultItems = [];

  // สร้างรายการรางวัลตาม betting_types ที่มีในระบบ
  for (const betType of lottery_type.betting_types) {
    let numbers = [];

    switch (betType.code) {
      case "6d_top":
        numbers = [huayResults.firstPrize];
        break;
      case "5d_top":
        numbers = [huayResults.firstPrize.slice(-5)];
        break;
      case "4d_top":
        numbers = [huayResults.firstPrize.slice(-4)];
        break;
      case "3top":
        numbers = [huayResults.firstPrize.slice(-3)];
        break;
      case "3toad":
        numbers = [huayResults.firstPrize.slice(-3)];
        break;
      case "3front":
        numbers = huayResults.frontThreeDigits;
        break;
      case "3back":
        numbers = huayResults.backThreeDigits;
        break;
      case "2top":
        numbers = [huayResults.firstPrize.slice(-2)];
        break;
      case "2bottom":
        numbers = [huayResults.backTwoDigits];
        break;
      case "1top":
        numbers = huayResults.firstPrize.slice(-3).split("");
        break;
      case "1bottom":
        numbers = huayResults.backTwoDigits.split("");
        break;
    }

    if (numbers.length > 0) {
      // สร้างและบันทึก LotteryResultItem
      const resultItem = await LotteryResultItem.create({
        lottery_result_id: lotteryResult._id,
        betting_type_id: betType.code,
        name: betType.name,
        reward: betType.payout_rate,
        numbers: numbers,
        winner_count: 0,
      });
      resultItems.push(resultItem);
    }
  }

  return resultItems;
};

// ประเมินผลการแทงหวยและค้นหาผู้ชนะ
exports.evaluateUserBetsByLotterySet = async function (
  lottery_set_id,
  createdBy
) {
  try {
    if (!lottery_set_id) {
      throw new Error("ต้องระบุ lottery_set_id");
    }

    // 1. รวบรวมเลขถูกรางวัลทั้งหมดในงวดนี้
    const huayResults = await this.printLotteryResults();
    const lottery_set = await LotterySets.findById(lottery_set_id);
    if (!lottery_set) {
      throw new Error("lottery_set_id is required.");
    }

    // ตรวจสอบว่ามี lottery_results อยู่แล้วหรือไม่
    let lotteryResult = await LotteryResult.findOne({ lottery_set_id });
    let resultItems = [];

    if (!lotteryResult) {
      console.log(lottery_set.lottery_type_id);
      const lottery_type = await LotteryType.findById(
        lottery_set.lottery_type_id
      );
      if (!lottery_type || lottery_type == null) {
        throw new Error("lottery_type_id is required.");
      }

      // 2. สร้างผลหวยในระบบใหม่
      lotteryResult = await LotteryResult.create({
        lottery_set_id,
        draw_date: new Date(),
        status: "published",
        createdBy,
      });

      // 3. บันทึกรายการรางวัลโดยใช้ฟังก์ชันใหม่
      const huay_results = await huay.find({ lottery_set_id: lottery_set_id });
      if (huay_results && huay_results.length > 0) {
        // สร้าง LotteryResultItems จากข้อมูลในตาราง huay
        for (const huayItem of huay_results) {
          // สร้างและบันทึก LotteryResultItem
          const resultItem = await LotteryResultItem.create({
            lottery_result_id: lotteryResult._id,
            betting_type_id: huayItem.code, // ใช้ code จาก huay เป็น betting_type_id
            name: huayItem.huay_name,
            reward:
              lottery_type.betting_types.find((bt) => bt.code === huayItem.code)
                ?.payout_rate || 0,
            numbers: huayItem.huay_number,
            winner_count: 0,
          });
          resultItems.push(resultItem);
        }
      } else {
        resultItems = await createLotteryResultItems(
          lottery_type,
          huayResults,
          lotteryResult
        );
      }
    } else {
      // ถ้ามี lottery_results อยู่แล้ว ให้ดึง resultItems ที่มีอยู่
      resultItems = await LotteryResultItem.find({
        lottery_result_id: lotteryResult._id,
      });
    }

    console.log(
      "📝 บันทึกรายการรางวัลทั้งหมดแล้ว:",
      resultItems.length,
      "รายการ"
    );

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = [];
    for (const userBet of pendingBets) {
      console.log(`👤 ตรวจ user: ${userBet.user_id}`);

      // ดึงข้อมูลผู้ใช้
      const user = await User.findById(userBet.user_id);
      if (!user) {
        console.error(`❌ ไม่พบข้อมูลผู้ใช้: ${userBet.user_id}`);
        continue;
      }

      let totalWinAmount = 0;

      // ตรวจสอบแต่ละรายการแทง
      for (const bet of userBet.bets) {
        // หารายการรางวัลที่ตรงกับประเภทการแทง
        const matchedResult = resultItems.find(
          (item) => item.betting_type_id === bet.betting_type_id
        );

        if (matchedResult) {
          console.log(`🎲 ตรวจประเภท: ${matchedResult.name}`);

          // ตรวจแต่ละเลขที่แทง
          for (const numObj of bet.numbers) {
            const userNumber = numObj.number;
            const amount = numObj.amount;

            // ตรวจสอบเลขอั้น
            const limitedNumber = await LotteryLimitedNumbers.find({
              lottery_set_id: lottery_set_id,
              betting_type_id: matchedResult.betting_type_id,
              number: userNumber,
            });
            if (limitedNumber && limitedNumber.length > 0) {
              if (limitedNumber[0].limit_type === "full") {
                console.log(`⛔ เลขอั้นประเภท full: ${userNumber}`);
                continue; // ข้ามไปเลขถัดไป
              }

              if (
                limitedNumber[0].limit_type === "cap" &&
                amount > limitedNumber[0].max_total_bet
              ) {
                console.log(`⚠️ เลขอั้นประเภท cap: ${userNumber} เกินกำหนด`);
                continue; // ข้ามไปเลขถัดไป
              }
            }

            // ตรวจว่าถูกรางวัลไหม
            const isWin = matchedResult.numbers.includes(userNumber);
            console.log(
              `➡️ แทงเลข: ${userNumber}, จำนวน: ${amount} | ${
                isWin ? "✅ ถูก" : "❌ ไม่ถูก"
              }`
            );

            if (isWin) {
              // คำนวณเงินรางวัล: จำนวนเงินที่แทง * อัตราจ่าย
              let payout_rate = matchedResult.reward;
              let payout_rate_partial = 0;
              let payout_type = "";
              let payout = 0;
              // ถ้าเป็นเลขอั้นประเภท partial ให้ใช้ payout_rate ของเลขอั้น
              const lotterylimit_partial = await LotteryLimitedNumbers.find({
                lottery_set_id: lottery_set_id,
                betting_type_id: matchedResult.betting_type_id,
                number: userNumber,
                limit_type: "partial",
              });
              if (lotterylimit_partial && lotterylimit_partial.length > 0) {
                payout_rate_partial = lotterylimit_partial[0].payout_rate;
                payout_type = lotterylimit_partial[0].payout_type;
                console.log(
                  `💡 ใช้อัตราจ่ายเลขอั้น: ${payout_rate}  ${payout_type}`
                );
              }
              if (payout_type === "rate") {
                payout = amount * payout_rate_partial;
              } else if (payout_type == "percentage") {
                payout = amount * payout_rate * (payout_rate_partial / 100);
                console.log(amount * payout_rate);
                console.log(payout_rate_partial / 100);
                console.log(`💡 ใช้อัตราจ่ายเลขอั้น: ${payout}`);
              } else {
                payout = amount * payout_rate;
              }
              totalWinAmount += payout;

              // สร้างรายการผู้ชนะ
              const winner = await LotteryWinner.create({
                user_id: userBet.user_id,
                bet_id: userBet._id,
                lottery_result_id: lotteryResult._id,
                betting_type_id: matchedResult.betting_type_id,
                lottery_set_id: lottery_set_id,
                matched_numbers: [userNumber],
                number: userNumber, // เพิ่มการเก็บเลขที่ถูกรางวัล
                payout: payout,
                status: "paid",
              });
              winners.push(winner);

              // อัพเดทจำนวนผู้ชนะใน LotteryResultItem
              matchedResult.winner_count += 1;
              await LotteryResultItem.findByIdAndUpdate(matchedResult._id, {
                winner_count: matchedResult.winner_count,
              });
            }
          }
        }
      }

      // ถ้ามีเงินรางวัล ให้เพิ่มเครดิตและบันทึกประวัติ
      if (totalWinAmount > 0) {
        // เพิ่มเครดิตให้ผู้ใช้
        user.credit += totalWinAmount;
        await user.save();

        // บันทึกประวัติการเพิ่มเครดิต
        await UserTransection.create({
          user_id: user._id,
          type: "payout",
          amount: totalWinAmount,
          detail: `ถูกรางวัลหวย งวดวันที่ ${huayResults.date}`,
          status: "success",
          balance_before: user.credit - totalWinAmount,
          balance_after: user.credit,
          ref_id: userBet._id,
          ref_model: "UserBet",
          description: `ถูกรางวัลหวย งวดวันที่ ${huayResults.date}`,
        });

        console.log(
          `💰 เพิ่มเครดิต ${totalWinAmount} บาท ให้ ${user.username}`
        );
      }

      // อัพเดทสถานะการตรวจ
      userBet.status = winners.some(
        (w) => w.bet_id.toString() === userBet._id.toString()
      )
        ? "won"
        : "lost";


      userBet.bets.forEach(bet => {
        bet.numbers.forEach(num => {
          // เช็คว่าเลขนี้ถูกรางวัลหรือไม่
          const isWinner = winners.some(w => 
            w.bet_id.toString() === userBet._id.toString() && 
            w.matched_numbers.includes(num.number) && 
            w.betting_type_id === bet.betting_type_id
          );
          num.is_won = isWinner;
        });
      });
      userBet.updated_at = new Date();
      await userBet.save();

      console.log(`🎯 ผล: ${userBet.status.toUpperCase()}`);
    }

    // อัพเดทสถานะ lottery_set เป็น resulted
    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });

    console.log(`\n✅ ตรวจเสร็จทั้งหมด ${pendingBets.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ evaluateUserBetsByLotterySet error:", error.message);
    throw error;
  }
};

// ดึงรายการผู้ชนะทั้งหมด
exports.getLotteryWinners = async (lottery_result_id) => {
  return await LotteryWinner.find({ lottery_result_id })
    .populate("user_id", "username")
    .populate("betting_type_id", "name")
    .populate("lottery_result_id", "draw_date");
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async (lottery_result_id) => {
  return await LotteryResultItem.find({ lottery_result_id }).populate(
    "betting_type_id",
    "name"
  );
};

exports.getAllHuay = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const total = await huay.countDocuments();
    const huays = await huay.find().skip(skip).limit(limit);
    return {
      huays,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to retrieve all Huay data:", error.message);
    throw new Error("Error retrieving all Huay data: " + error.message);
  }
};
