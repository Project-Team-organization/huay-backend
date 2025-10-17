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
const lotteryLaoHd = require("../../models/lottery_lao_hd.model");
const lotteryLao = require("../../models/lotterylao.model");
const lotteryLaoExtra = require("../../models/lotterylao.extra.model");
const lotteryLaoStars = require("../../models/lotterylao.stars.model");
const lotteryLaoUnion = require("../../models/lotterylao.union.model");
const lotteryLaoStarsVip = require("../../models/lottery_lao_stars_vip.model");
const lotteryLaoRedcross = require("../../models/lottery_lao_redcross.model");
const lotteryLaoThakhekVip = require("../../models/lottery_lao_thakhek_vip.model");
const lotteryLaoThakhek5d = require("../../models/lottery_lao_thakhek_5d.model");
const lotteryLaoTv = require("../../models/lottery_lao_tv.model");
const lotteryLaoVip = require("../../models/lottery_lao_vip.model");
const lotteryThaiSavings = require("../../models/lottery_thai_savings.model");
const lotteryThaiGsb = require("../../models/lottery_thai_gsb.model");
const lotteryMagnum4d = require("../../models/lottery_magnum_4d.model");
const lotterySingapore4d = require("../../models/lottery_singapore_4d.model");
const lotteryGrandDragon4d = require("../../models/lottery_grand_dragon_4d.model");
const lotteryHanoiAsean = require("../../models/lottery_hanoi_asean.model");
const lotteryHanoiHd = require("../../models/lottery_hanoi_hd.model");
const lotteryHanoiStar = require("../../models/lottery_hanoi_star.model");
const lotteryHanoiTv = require("../../models/lottery_hanoi_tv.model");
const lotteryHanoiSpecial = require("../../models/lottery_hanoi_special.model");
const lotteryHanoiRedcross = require("../../models/lottery_hanoi_redcross.model");
const lotteryHanoiSpecialApi = require("../../models/lottery_hanoi_special_api.model");
const lotteryHanoi = require("../../models/lottery_hanoi.model");
const lotteryHanoiDevelop = require("../../models/lottery_hanoi_develop.model");
const lotteryHanoiVip = require("../../models/lottery_hanoi_vip.model");
const lotteryHanoiExtra = require("../../models/lottery_hanoi_extra.model");

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

// ฟังก์ชันใหม่สำหรับสร้างผลหวยแบบกรอกมือหวย
exports.createManualHuay = async (huays, lottery_set_id) => {
  try {
    const set = await LotterySets.findById(lottery_set_id);
    if (!set) {
      throw new Error("Invalid lottery_set_id : set not found.");
    }

    // สร้างข้อมูลหวยทั้งหมดที่จะบันทึก
    const allHuayData = [];

    for (const huay of huays) {
      const { code, number, huay_name } = huay;

      // แปลงเลขเป็น string และตรวจสอบความยาว
      const numberStr = number.toString();

      // สร้างเลขหวยตามประเภท (code)
      let huayNumbers = [];

      switch (code) {
        case "6d_top":
          // รางวัลที่ 1 (6 หลัก)
          huayNumbers = [numberStr];
          break;

        case "5d_top":
          // 5 ตัวบน (5 หลักท้าย)
          if (numberStr.length >= 5) {
            huayNumbers = [numberStr.slice(-5)];
          }
          break;

        case "4d_top":
          // 4 ตัวบน (4 หลักท้าย)
          if (numberStr.length >= 4) {
            huayNumbers = [numberStr.slice(-4)];
          }
          break;

        case "3d_top":
          // 3 ตัวบน (3 หลักท้าย)
          if (numberStr.length >= 3) {
            huayNumbers = [numberStr.slice(-3)];
          }
          break;

        case "2d_top":
          // 2 ตัวบน (2 หลักท้าย)
          if (numberStr.length >= 2) {
            huayNumbers = [numberStr.slice(-2)];
          }
          break;

        case "3d_front":
          // 3 ตัวหน้า (3 หลักแรก)
          if (numberStr.length >= 3) {
            huayNumbers = [numberStr.slice(0, 3)];
          }
          break;

        case "3d_front_2":
          // 3 ตัวหน้าเพิ่มเติม (สร้างจากเลขหน้า)
          if (numberStr.length >= 3) {
            const front3 = numberStr.slice(0, 3);
            // สร้างเลข 3 ตัวหน้าแบบโต๊ด
            const digits = front3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "3d_bottom":
          // 3 ตัวล่าง (สร้างจากเลขท้าย)
          if (numberStr.length >= 3) {
            const bottom3 = numberStr.slice(-3);
            // สร้างเลข 3 ตัวล่างแบบโต๊ด
            const digits = bottom3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "2d_bottom":
          // 2 ตัวล่าง (2 หลักท้าย)
          if (numberStr.length >= 2) {
            huayNumbers = [numberStr.slice(-2)];
          }
          break;

        case "3d_toot":
          // 3 ตัวโต๊ดหลังรางวัลที่ 1
          if (numberStr.length >= 3) {
            const bottom3 = numberStr.slice(-3);
            const digits = bottom3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "4d_toot":
          // 4 ตัวโต๊ด
          if (numberStr.length >= 4) {
            const bottom4 = numberStr.slice(-4);
            const digits = bottom4.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  for (let l = 0; l < digits.length; l++) {
                    if (
                      i !== j &&
                      i !== k &&
                      i !== l &&
                      j !== k &&
                      j !== l &&
                      k !== l
                    ) {
                      permutations.push(
                        digits[i] + digits[j] + digits[k] + digits[l]
                      );
                    }
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "3d_front_toot":
          // 3 ตัวโต๊ดหน้ารางวัลที่ 1
          if (numberStr.length >= 3) {
            const front3 = numberStr.slice(0, 3);
            const digits = front3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "3d_front_toot_2":
          // 3 ตัวโต๊ดหน้าเพิ่มเติม
          if (numberStr.length >= 3) {
            const front3 = numberStr.slice(0, 3);
            const digits = front3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "3d_bottom_toot":
          // 3 ตัวโต๊ดล่าง
          if (numberStr.length >= 3) {
            const bottom3 = numberStr.slice(-3);
            const digits = bottom3.split("");
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                  if (i !== j && i !== k && j !== k) {
                    permutations.push(digits[i] + digits[j] + digits[k]);
                  }
                }
              }
            }
            huayNumbers = [...new Set(permutations)];
          }
          break;

        case "1top":
          // วิ่งบน (เลขเดี่ยวจาก 3 หลักท้าย)
          if (numberStr.length >= 3) {
            const bottom3 = numberStr.slice(-3);
            huayNumbers = bottom3.split("");
          }
          break;

        case "1bottom":
          // วิ่งล่าง (เลขเดี่ยวจาก 2 หลักท้าย)
          if (numberStr.length >= 2) {
            const bottom2 = numberStr.slice(-2);
            huayNumbers = bottom2.split("");
          }
          break;

        default:
          // กรณีอื่นๆ ให้ใช้เลขที่กรอกโดยตรง
          huayNumbers = [numberStr];
      }

      // สร้างข้อมูลหวยสำหรับแต่ละประเภท
      if (huayNumbers.length > 0) {
        const huayData = {
          lottery_set_id: lottery_set_id,
          huay_name: huay_name || getHuayNameByCode(code),
          code: code,
          name: "thai-lottery",
          huay_number: huayNumbers,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        allHuayData.push(huayData);
      }
    }

    // บันทึกข้อมูลหวยทั้งหมด
    if (allHuayData.length > 0) {
      const result = await huay.insertMany(allHuayData);
      return result;
    } else {
      throw new Error("No valid huay data to create");
    }
  } catch (error) {
    console.error("Failed to create Manual Huay data:", error.message);
    throw new Error("Error creating Manual Huay data: " + error.message);
  }
};

// ฟังก์ชันช่วยสำหรับสร้างชื่อหวยตาม code
function getHuayNameByCode(code) {
  const codeNames = {
    "6d_top": "รางวัลที่ 1",
    "5d_top": "5 ตัวบน",
    "4d_top": "4 ตัวบน",
    "3d_top": "3 ตัวบน",
    "2d_top": "2 ตัวบน",
    "3d_front": "3 ตัวหน้ารางวัลที่ 1",
    "3d_front_2": "3 ตัวหน้า",
    "3d_bottom": "3 ตัวล่าง",
    "2d_bottom": "2 ตัวล่าง",
    "3d_toot": "3 ตัวโต๊ดหลังรางวัลที่ 1",
    "4d_toot": "4 ตัวโต๊ด",
    "3d_front_toot": "3 ตัวโต๊ดหน้ารางวัลที่ 1",
    "3d_front_toot_2": "3 ตัวโต๊ดหน้า",
    "3d_bottom_toot": "3 ตัวโต๊ดล่าง",
    "1top": "วิ่งบน",
    "1bottom": "วิ่งล่าง",
  };

  return codeNames[code] || code;
}

exports.getHuay = async lottery_set_id => {
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

exports.getHuayById = async huayId => {
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
        p => p.id === "prizeFirst"
      );
      return first.number[0]; // เช่น "123456"
    };

    // ฟังก์ชันสำหรับดึงเลขหน้า 3 ตัว
    const getFrontThreeDigits = () => {
      const front = lotteryData.response.runningNumbers.find(
        r => r.id === "runningNumberFrontThree"
      );
      return front.number; // เช่น ["123", "456"]
    };

    // ฟังก์ชันสำหรับดึงเลขท้าย 3 ตัว
    const getBackThreeDigits = () => {
      const back = lotteryData.response.runningNumbers.find(
        r => r.id === "runningNumberBackThree"
      );
      return back.number; // เช่น ["789", "012"]
    };

    // ฟังก์ชันสำหรับดึงเลขท้าย 2 ตัว
    const getBackTwoDigits = () => {
      const back = lotteryData.response.runningNumbers.find(
        r => r.id === "runningNumberBackTwo"
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

    // กรองค่าว่างออก
    const validNumbers = numbers.filter(
      num => num && String(num).trim() !== ""
    );

    if (validNumbers.length > 0) {
      // สร้างและบันทึก LotteryResultItem
      const resultItem = await LotteryResultItem.create({
        lottery_result_id: lotteryResult._id,
        betting_type_id: betType.code,
        name: betType.name,
        reward: betType.payout_rate,
        numbers: validNumbers,
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

    const lottery_set = await LotterySets.findById(lottery_set_id);
    const lottery_type = await LotteryType.findById(
      lottery_set.lottery_type_id
    );
    if (!lottery_set) {
      throw new Error("lottery_set_id is required.");
    }

    // แยก แต่ละ ประเภท หวย
    if (lottery_set.name === "หวยรัฐบาล") {
      console.log("🇹🇭 ประมวลผลหวยไทย (หวยรัฐบาล)");
      const result = await processlotterythai(
        lottery_set_id,
        createdBy,
        lottery_set
      );
      return result;
    } else if (lottery_set.name === "หวยลาว HD") {
      console.log("🇱🇦 ประมวลผลหวยลาว HD");
      const result = await processlotterylaohd(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวพัฒนา") {
      console.log("🇱🇦 ประมวลผลหวยลาว");
      const result = await processlotterylao(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาว Extra") {
      console.log("🇱🇦 ประมวลผลหวยลาว Extra");
      const result = await processlotterylaoextra(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวสตาร์") {
      console.log("🇱🇦 ประมวลผลหวยลาวสตาร์");
      const result = await processlotterylaostars(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวสามัคคี") {
      console.log("🇱🇦 ประมวลผลหวยลาว Union");
      const result = await processlotterylao_union(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวสตาร์ VIP") {
      console.log("🇱🇦 ประมวลผลหวยลาวสตาร์ VIP");
      const result = await processlotterylaostars_vip(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวกาชาด") {
      console.log("🇱🇦 ประมวลผลหวยลาวกาชาด");
      const result = await processlotterylao_redcross(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวท่าแขก VIP") {
      console.log("🇱🇦 ประมวลผลหวยลาวท่าแขก VIP");
      const result = await processlotterylao_thakhek_vip(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาวท่าแขก 5D") {
      console.log("🇱🇦 ประมวลผลหวยลาวท่าแขก 5D");
      const result = await processlotterylao_thakhek_5d(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาว TV") {
      console.log("🇱🇦 ประมวลผลหวยลาว TV");
      const result = await processlotterylao_tv(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยลาว VIP") {
      console.log("🇱🇦 ประมวลผลหวยลาว VIP");
      const result = await processlotterylao_vip(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยออมสิน") {
      console.log("🇹🇭 ประมวลผลหวยออมสิน");
      const result = await processlottery_thai_savings(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวย ธกส") {
      console.log("🇹🇭 ประมวลผลหวย ธกส");
      const result = await processlottery_thai_gsb(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวย Magnum 4D") {
      console.log("🎲 ประมวลผลหวย Magnum 4D");
      const result = await processlottery_magnum_4d(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวย Singapore 4D") {
      console.log("🎲 ประมวลผลหวย Singapore 4D");
      const result = await processlottery_singapore_4d(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวย Grand Dragon 4D") {
      console.log("🎲 ประมวลผลหวย Grand Dragon 4D");
      const result = await processlottery_grand_dragon_4d(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยอาเซียน") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยอาเซียน");
      const result = await processlottery_hanoi_asean(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอย HD") {
      console.log("🇻🇳 ประมวลผลหวยฮานอย HD");
      const result = await processlottery_hanoi_hd(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยสตาร์") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยสตาร์");
      const result = await processlottery_hanoi_star(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอย TV") {
      console.log("🇻🇳 ประมวลผลหวยฮานอย TV");
      const result = await processlottery_hanoi_tv(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยเฉพาะกิจ") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยเฉพาะกิจ");
      const result = await processlottery_hanoi_special(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยกาชาด") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยกาชาด");
      const result = await processlottery_hanoi_redcross(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยพิเศษ") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยพิเศษ");
      const result = await processlottery_hanoi_special_api(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอย") {
      console.log("🇻🇳 ประมวลผลหวยฮานอย");
      const result = await processlottery_hanoi(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอยพัฒนา") {
      console.log("🇻🇳 ประมวลผลหวยฮานอยพัฒนา");
      const result = await processlottery_hanoi_develop(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอย VIP") {
      console.log("🇻🇳 ประมวลผลหวยฮานอย VIP");
      const result = await processlottery_hanoi_vip(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยฮานอย EXTRA") {
      console.log("🇻🇳 ประมวลผลหวยฮานอย EXTRA");
      const result = await processlottery_hanoi_extra(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยยี่กี") {
      console.log("🎲 ประมวลผลหวยยี่กี");
      const result = await processLotteryYiKee(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยยี่กี 4G") {
      console.log("🎲 ประมวลผลหวยยี่กี 4G");
      const result = await processLotteryYiKee4G(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else if (lottery_set.name === "หวยยี่กี 5G") {
      console.log("🎲 ประมวลผลหวยยี่กี 5G");
      const result = await processLotteryYiKee5G(
        lottery_set_id,
        createdBy,
        lottery_set,
        lottery_type
      );
      return result;
    } else {
      console.log(`🎯 ประมวลผลหวยประเภทอื่น: ${lottery_set.name}`);
      // TODO: เพิ่มฟังก์ชันสำหรับหวยประเภทอื่นๆ
      throw new Error("ยังไม่รองรับหวยประเภทนี้");
    }
  } catch (error) {
    console.error("❌ evaluateUserBetsByLotterySet error:", error.message);
    throw error;
  }
};

// ฟังก์ชันช่วยเหลือสำหรับอัพเดทสถานะ lottery_set เป็น resulted
// เรียกใช้ทันทีหลังสร้าง LotteryResult เพื่อป้องกันการประมวลผลซ้ำ
async function markLotterySetAsResulted(lottery_set_id) {
  try {
    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`✅ อัพเดทสถานะ lottery_set เป็น resulted แล้ว`);
  } catch (error) {
    console.error("❌ markLotterySetAsResulted error:", error.message);
    throw error;
  }
}

async function processlotterythai(lottery_set_id, createdBy, lottery_set) {
  try {
    console.log("🇹🇭 เริ่มประมวลผลหวยไทย (หวยรัฐบาล)");

    // 1. รวบรวมเลขถูกรางวัลทั้งหมดในงวดนี้
    const huayResults = await exports.printLotteryResults();

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

      // อัพเดทสถานะเป็น resulted ทันทีเพื่อป้องกันการประมวลผลซ้ำ
      await markLotterySetAsResulted(lottery_set_id);

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
              lottery_type.betting_types.find(bt => bt.code === huayItem.code)
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
          item => item.betting_type_id === bet.betting_type_id
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
                betting_name: matchedResult.name,
                lottery_result_id: lotteryResult._id,
                betting_type_id: matchedResult.betting_type_id,
                lottery_set_id: lottery_set_id,
                matched_numbers: [userNumber],
                number: userNumber, // เพิ่มการเก็บเลขที่ถูกรางวัล
                bet_amount: amount,
                payout: payout_rate,
                reward: totalWinAmount,
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
        w => w.bet_id.toString() === userBet._id.toString()
      )
        ? "won"
        : "lost";

      userBet.bets.forEach(bet => {
        bet.numbers.forEach(num => {
          // เช็คว่าเลขนี้ถูกรางวัลหรือไม่
          const isWinner = winners.some(
            w =>
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

    console.log(`\n✅ ตรวจเสร็จทั้งหมด ${pendingBets.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterythai error:", error.message);
    throw error;
  }
}

async function processlotterylaohd(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว HD");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    // 1 . ไปดึงผลหวยลาว HD ล่าสุด ไปดึงผลล่าสุดมาก
    const resulthuay = await lotteryLaoHd.findOne({}).sort({ createdAt: -1 });

    // 2 . สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // อัพเดทสถานะเป็น resulted ทันทีเพื่อป้องกันการประมวลผลซ้ำ
    await markLotterySetAsResulted(lottery_set_id);

    // 3. บันทึกรายการรางวัลโดยใช้ฟังก์ชันใหม่
    const betting_types = resulthuay.betting_types;

    // แปลง digit จาก string เป็น array
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType), // ใช้ _doc ถ้าเป็น mongoose document
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
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
          item => item.betting_type_id === bet.betting_type_id
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
                betting_name: matchedResult.name,
                lottery_result_id: lotteryResult._id,
                betting_type_id: matchedResult.betting_type_id,
                lottery_set_id: lottery_set_id,
                matched_numbers: [userNumber],
                number: userNumber, // เพิ่มการเก็บเลขที่ถูกรางวัล
                bet_amount: amount,
                payout: payout_rate,
                reward: totalWinAmount,
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
          detail: `ถูกรางวัลหวยลาว HD งวดวันที่ ${
            new Date().toISOString().split("T")[0]
          }`,
          status: "success",
          balance_before: user.credit - totalWinAmount,
          balance_after: user.credit,
          ref_id: userBet._id,
          ref_model: "UserBet",
          description: `ถูกรางวัลหวยลาว HD งวดวันที่ ${
            new Date().toISOString().split("T")[0]
          }`,
        });

        console.log(
          `💰 เพิ่มเครดิต ${totalWinAmount} บาท ให้ ${user.username}`
        );
      }

      // อัพเดทสถานะการตรวจ
      userBet.status = winners.some(
        w => w.bet_id.toString() === userBet._id.toString()
      )
        ? "won"
        : "lost";

      userBet.bets.forEach(bet => {
        bet.numbers.forEach(num => {
          // เช็คว่าเลขนี้ถูกรางวัลหรือไม่
          const isWinner = winners.some(
            w =>
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

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylaohd error:", error.message);
    throw error;
  }
}

const createLotteryResultItemsLao = async (
  lottery_set,
  lotteryResult,
  processedBettingTypes,
  lottery_type
) => {
  const resultItems = [];
  const bettingTypes = lottery_type.betting_types || [];

  for (const bettingType of processedBettingTypes) {
    // กรองค่าว่างออกจาก digit array
    const validNumbers = Array.isArray(bettingType.digit)
      ? bettingType.digit.filter(num => num && num.trim() !== "")
      : [];

    // ข้ามการสร้าง item ถ้าไม่มีเลข
    if (validNumbers.length === 0) {
      console.log(`⚠️ ข้าม ${bettingType.name} เพราะไม่มีเลขผลรางวัล`);
      continue;
    }

    const payoutRate =
      bettingTypes.find(bt => bt.code === bettingType.code)?.payout_rate || 0;
    const resultItem = await LotteryResultItem.create({
      lottery_result_id: lotteryResult._id,
      betting_type_id: bettingType.code,
      name: bettingType.name,
      reward: payoutRate,
      numbers: validNumbers,
      winner_count: 0,
    });
    resultItems.push(resultItem);
  }
  return resultItems;
};

// ฟังก์ชันเฉพาะสำหรับหวยฮานอย
const createLotteryResultItemsHanoi = async (
  lottery_set,
  lotteryResult,
  processedBettingTypes,
  lottery_type
) => {
  const resultItems = [];
  const bettingTypes = lottery_type.betting_types || [];

  for (const bettingType of processedBettingTypes) {
    const payoutRate =
      bettingTypes.find(bt => bt.code === bettingType.code)?.payout_rate || 0;

    // สำหรับหวยฮานอย digit มาพร้อมเป็น array แล้ว
    const numbers = Array.isArray(bettingType.digit)
      ? bettingType.digit
      : [bettingType.digit];

    // กรองค่าว่างออก
    const validNumbers = numbers.filter(
      num => num && String(num).trim() !== ""
    );

    // ข้ามการสร้าง item ถ้าไม่มีเลข
    if (validNumbers.length === 0) {
      console.log(`⚠️ ข้าม ${bettingType.name} เพราะไม่มีเลขผลรางวัล`);
      continue;
    }

    const resultItem = await LotteryResultItem.create({
      lottery_result_id: lotteryResult._id,
      betting_type_id: bettingType.code,
      name: bettingType.name,
      reward: payoutRate,
      numbers: validNumbers,
      winner_count: 0,
    });
    resultItems.push(resultItem);
  }
  return resultItems;
};

// ฟังก์ชันสำหรับการตรวจรางวัลและบันทึกผู้ชนะ
const processLotteryWinners = async (
  pendingBets,
  resultItems,
  lottery_set_id,
  lotteryName
) => {
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
        item => item.betting_type_id === bet.betting_type_id
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
              betting_name: matchedResult.name,
              lottery_result_id: resultItems[0].lottery_result_id,
              betting_type_id: matchedResult.betting_type_id,
              lottery_set_id: lottery_set_id,
              matched_numbers: [userNumber],
              number: userNumber, // เพิ่มการเก็บเลขที่ถูกรางวัล
              bet_amount: amount,
              payout: payout_rate,
              reward: totalWinAmount,
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
        detail: `ถูกรางวัล${lotteryName} งวดวันที่ ${
          new Date().toISOString().split("T")[0]
        }`,
        status: "success",
        balance_before: user.credit - totalWinAmount,
        balance_after: user.credit,
        ref_id: userBet._id,
        ref_model: "UserBet",
        description: `ถูกรางวัล${lotteryName} งวดวันที่ ${
          new Date().toISOString().split("T")[0]
        }`,
      });

      console.log(`💰 เพิ่มเครดิต ${totalWinAmount} บาท ให้ ${user.username}`);
    }

    // อัพเดทสถานะการตรวจ
    userBet.status = winners.some(
      w => w.bet_id.toString() === userBet._id.toString()
    )
      ? "won"
      : "lost";

    userBet.bets.forEach(bet => {
      bet.numbers.forEach(num => {
        // เช็คว่าเลขนี้ถูกรางวัลหรือไม่
        const isWinner = winners.some(
          w =>
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

  return winners;
};

// ฟังก์ชันสำหรับหวยลาว
async function processlotterylao(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    // 1. ไปดึงผลหวยลาวล่าสุด
    const resulthuay = await lotteryLao.findOne({}).sort({ createdAt: -1 });

    // 2. สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // 3. บันทึกรายการรางวัลโดยใช้ฟังก์ชันใหม่
    const betting_types = resulthuay.betting_types;

    // แปลง digit จาก string เป็น array
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาว"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาว Extra
async function processlotterylaoextra(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว Extra");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoExtra
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาว Extra"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylaoextra error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาวสตาร์
async function processlotterylaostars(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาวสตาร์");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoStars
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาวสตาร์"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylaostars error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาว Union
async function processlotterylao_union(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว Union");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoUnion
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาว Union"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_union error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาวสตาร์ VIP
async function processlotterylaostars_vip(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาวสตาร์ VIP");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoStarsVip
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาวสตาร์ VIP"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylaostars_vip error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาวกาชาด
async function processlotterylao_redcross(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาวกาชาด");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoRedcross
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาวกาชาด"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_redcross error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาวท่าแขก VIP
async function processlotterylao_thakhek_vip(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาวท่าแขก VIP");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoThakhekVip
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาวท่าแขก VIP"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_thakhek_vip error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาวท่าแขก 5D
async function processlotterylao_thakhek_5d(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาวท่าแขก 5D");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoThakhek5d
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาวท่าแขก 5D"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_thakhek_5d error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาว TV
async function processlotterylao_tv(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว TV");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoTv.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาว TV"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_tv error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยลาว VIP
async function processlotterylao_vip(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇱🇦 เริ่มประมวลผลหวยลาว VIP");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryLaoVip.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยลาว VIP"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlotterylao_vip error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยออมสิน
async function processlottery_thai_savings(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇹🇭 เริ่มประมวลผลหวยออมสิน");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryThaiSavings
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยออมสิน"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_thai_savings error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวย ธกส
async function processlottery_thai_gsb(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇹🇭 เริ่มประมวลผลหวย ธกส");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryThaiGsb.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit.includes(",")
          ? bettingType.digit.split(",").map(d => d.trim())
          : [bettingType.digit.trim()],
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวย ธกส"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_thai_gsb error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวย Magnum 4D
async function processlottery_magnum_4d(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวย Magnum 4D");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryMagnum4d
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = (resulthuay && resulthuay.betting_types) || [];
    const processedBettingTypes = betting_types.map(bettingType => {
      const source = bettingType._doc || bettingType;
      const rawDigit = source && source.digit;
      let normalizedDigits = [];
      if (rawDigit == null) {
        normalizedDigits = [];
      } else if (Array.isArray(rawDigit)) {
        normalizedDigits = rawDigit.map(d => String(d).trim()).filter(Boolean);
      } else {
        const str = String(rawDigit);
        normalizedDigits = str.includes(",")
          ? str
              .split(",")
              .map(d => d.trim())
              .filter(Boolean)
          : [str.trim()].filter(Boolean);
      }
      return {
        ...source,
        digit: normalizedDigits,
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวย Magnum 4D"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_magnum_4d error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวย Singapore 4D
async function processlottery_singapore_4d(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวย Singapore 4D");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotterySingapore4d
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = (resulthuay && resulthuay.betting_types) || [];
    const processedBettingTypes = betting_types.map(bettingType => {
      const source = bettingType._doc || bettingType;
      const rawDigit = source && source.digit;
      let normalizedDigits = [];
      if (rawDigit == null) {
        normalizedDigits = [];
      } else if (Array.isArray(rawDigit)) {
        normalizedDigits = rawDigit.map(d => String(d).trim()).filter(Boolean);
      } else {
        const str = String(rawDigit);
        normalizedDigits = str.includes(",")
          ? str
              .split(",")
              .map(d => d.trim())
              .filter(Boolean)
          : [str.trim()].filter(Boolean);
      }
      return {
        ...source,
        digit: normalizedDigits,
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวย Singapore 4D"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_singapore_4d error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวย Grand Dragon 4D
async function processlottery_grand_dragon_4d(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวย Grand Dragon 4D");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryGrandDragon4d
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // อัพเดทสถานะเป็น resulted ทันทีเพื่อป้องกันการประมวลผลซ้ำ
    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      const digitValue = bettingType.digit;
      let digitArray;

      // ตรวจสอบว่า digit เป็น array อยู่แล้วหรือไม่
      if (Array.isArray(digitValue)) {
        digitArray = digitValue;
      } else if (typeof digitValue === "string") {
        // ถ้าเป็น string ให้แยกด้วย comma
        digitArray = digitValue.includes(",")
          ? digitValue.split(",").map(d => d.trim())
          : [digitValue.trim()];
      } else {
        digitArray = [String(digitValue)];
      }

      return {
        ...(bettingType._doc || bettingType),
        digit: digitArray,
      };
    });
    const resultItems = await createLotteryResultItemsLao(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวย Grand Dragon 4D"
    );

    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_grand_dragon_4d error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยอาเซียน
async function processlottery_hanoi_asean(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยอาเซียน");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiAsean
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยอาเซียน"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_asean error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอย HD
async function processlottery_hanoi_hd(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอย HD");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiHd.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอย HD"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_hd error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยสตาร์
async function processlottery_hanoi_star(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยสตาร์");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiStar
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยสตาร์"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_star error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอย TV
async function processlottery_hanoi_tv(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอย TV");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiTv.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอย TV"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_tv error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยเฉพาะกิจ
async function processlottery_hanoi_special(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยเฉพาะกิจ");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiSpecial
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยเฉพาะกิจ"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_special error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยกาชาด
async function processlottery_hanoi_redcross(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยกาชาด");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiRedcross
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยกาชาด"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_redcross error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยพิเศษ
async function processlottery_hanoi_special_api(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยพิเศษ");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiSpecialApi
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยพิเศษ"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_special_api error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอย
async function processlottery_hanoi(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอย");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoi.findOne({}).sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอย"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอยพัฒนา
async function processlottery_hanoi_develop(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอยพัฒนา");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiDevelop
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอยพัฒนา"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_develop error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอย VIP
async function processlottery_hanoi_vip(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอย VIP");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiVip
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอย VIP"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_vip error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับหวยฮานอย EXTRA
async function processlottery_hanoi_extra(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🇻🇳 เริ่มประมวลผลหวยฮานอย EXTRA");
    console.log(
      "🔍 lottery_set structure:",
      JSON.stringify(lottery_set, null, 2)
    );

    const resulthuay = await lotteryHanoiExtra
      .findOne({})
      .sort({ createdAt: -1 });
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    const betting_types = resulthuay.betting_types;
    const processedBettingTypes = betting_types.map(bettingType => {
      return {
        ...(bettingType._doc || bettingType),
        digit: bettingType.digit, // หวยฮานอย digit มาพร้อมเป็น array แล้ว
      };
    });
    const resultItems = await createLotteryResultItemsHanoi(
      lottery_set,
      lotteryResult,
      processedBettingTypes,
      lottery_type
    );

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยฮานอย EXTRA"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(`🏆 ประมวลผลเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`);

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processlottery_hanoi_extra error:", error.message);
    throw error;
  }
}

// ดึงรายการผู้ชนะทั้งหมด
exports.getLotteryWinners = async lottery_result_id => {
  return await LotteryWinner.find({ lottery_result_id })
    .populate("user_id", "username")
    .populate("betting_type_id", "name")
    .populate("lottery_result_id", "draw_date");
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async lottery_result_id => {
  return await LotteryResultItem.find({ lottery_result_id }).populate(
    "betting_type_id",
    "name"
  );
};

exports.getAllHuay = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const filterCodes = ["6d_top", "3d_front_2", "3d_bottom", "2d_bottom"];

    // Pipeline aggregation
    const pipeline = [
      {
        $match: {
          code: { $in: filterCodes },
        },
      },
      {
        $group: {
          _id: "$lottery_set_id",
          huays: {
            $push: {
              huay_name: "$huay_name",
              code: "$code",
              huay_number: "$huay_number",
            },
          },
        },
      },
      {
        $lookup: {
          from: "lotterysets",
          localField: "_id",
          foreignField: "_id",
          as: "lottery_set_info",
        },
      },
      {
        $unwind: {
          path: "$lottery_set_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                lottery_set_name: "$lottery_set_info.name",
                huays: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await huay.aggregate(pipeline);
    const huayGroups = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;

    const formattedHuays = huayGroups.map(item => ({
      _id: item._id,
      lottery_set_name: item.lottery_set_name,
      huays: item.huays,
    }));

    return {
      huays: formattedHuays,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Failed to aggregate Huay data:", error.message);
    throw new Error("Error aggregating Huay data: " + error.message);
  }
};

exports.getLatestResultedHuay = async function () {
  try {
    // หา lottery_set ล่าสุดที่มีสถานะ resulted
    const latestResultedSet = await LotterySets.findOne({
      status: "resulted",
    })
      .sort({ result_time: -1 })
      .select("_id name result_time");

    if (!latestResultedSet) {
      throw new Error("ไม่พบข้อมูลหวยที่ออกผลล่าสุด");
    }

    // ดึงข้อมูลหวยจากงวดล่าสุด
    const huayResults = await huay
      .find({
        lottery_set_id: latestResultedSet._id,
      })
      .sort({ code: 1 }); // เรียงตาม code

    if (!huayResults.length) {
      throw new Error("ไม่พบข้อมูลผลหวยในงวดล่าสุด");
    }

    const huaythai = {
      lottery_set: latestResultedSet,
      results: huayResults.map(result => ({
        huay_name: result.huay_name,
        huay_number: result.huay_number,
        code: result.code,
      })),
    };

    const huaylao = {};
    return {
      huaythai,
      huaylao,
    };
  } catch (error) {
    console.error("Error getting latest resulted huay:", error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับ random เลขหวยยี่กี
function generateYiKeeNumbers() {
  // สร้างเลข 5 หลัก (00000-99999)
  const mainNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return {
    mainNumber: mainNumber,
    // 3 ตัวบน (3 หลักท้าย)
    "3top": mainNumber.slice(-3),
    // 3 ตัวโต๊ด (จาก 3 หลักท้าย)
    "3toad": generateToadNumbers(mainNumber.slice(-3)),
    // 2 ตัวบน (2 หลักท้าย)
    "2top": mainNumber.slice(-2),
    // 2 ตัวล่าง (2 หลักท้าย)
    "2bottom": mainNumber.slice(-2),
    // วิ่งบน (เลขเดี่ยวจาก 3 หลักท้าย)
    "1top": mainNumber.slice(-3).split(""),
    // วิ่งล่าง (เลขเดี่ยวจาก 2 หลักท้าย)
    "1bottom": mainNumber.slice(-2).split(""),
  };
}

// ฟังก์ชันสำหรับสร้างเลขโต๊ด
function generateToadNumbers(threeDigits) {
  const digits = threeDigits.split("");
  const permutations = [];

  // สร้างการเรียงสับเปลี่ยนทั้งหมด
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      for (let k = 0; k < digits.length; k++) {
        if (i !== j && i !== k && j !== k) {
          permutations.push(digits[i] + digits[j] + digits[k]);
        }
      }
    }
  }

  // ลบเลขที่ซ้ำกัน
  return [...new Set(permutations)];
}

// ฟังก์ชันสำหรับประมวลผลหวยยี่กี
async function processLotteryYiKee(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวยยี่กี");

    // 1. สร้างเลขผลออกแบบ random
    const yiKeeResults = generateYiKeeNumbers();
    console.log("🎯 เลขที่ออก:", yiKeeResults.mainNumber);

    // บันทึกผลลงในตาราง huay
    await saveYiKeeResultsToHuay(lottery_set_id, yiKeeResults, "หวยยี่กี");

    // 2. สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // 3. บันทึกรายการรางวัลตาม betting_types
    const resultItems = [];

    for (const betType of lottery_type.betting_types) {
      let numbers = [];

      switch (betType.code) {
        case "3top":
          numbers = [yiKeeResults["3top"]];
          break;
        case "3toad":
          numbers = yiKeeResults["3toad"];
          break;
        case "2top":
          numbers = [yiKeeResults["2top"]];
          break;
        case "2bottom":
          numbers = [yiKeeResults["2bottom"]];
          break;
        case "1top":
          numbers = yiKeeResults["1top"];
          break;
        case "1bottom":
          numbers = yiKeeResults["1bottom"];
          break;
      }

      if (numbers.length > 0) {
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

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยยี่กี"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(
      `🏆 ประมวลผลหวยยี่กีเสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`
    );

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processLotteryYiKee error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับประมวลผลหวยยี่กี 4G
async function processLotteryYiKee4G(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวยยี่กี 4G");

    // 1. สร้างเลขผลออกแบบ random (4 หลัก)
    const mainNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    console.log("🎯 เลขที่ออก:", mainNumber);

    const yiKee4GResults = {
      mainNumber: mainNumber,
      "4top": mainNumber,
      "3top": mainNumber.slice(-3),
      "3toad": generateToadNumbers(mainNumber.slice(-3)),
      "2top": mainNumber.slice(-2),
      "2bottom": mainNumber.slice(-2),
      "1top": mainNumber.slice(-3).split(""),
      "1bottom": mainNumber.slice(-2).split(""),
    };

    // บันทึกผลลงในตาราง huay
    await saveYiKeeResultsToHuay(lottery_set_id, yiKee4GResults, "หวยยี่กี 4G");

    // 2. สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // 3. บันทึกรายการรางวัลตาม betting_types
    const resultItems = [];

    for (const betType of lottery_type.betting_types) {
      let numbers = [];

      switch (betType.code) {
        case "4top":
          numbers = [yiKee4GResults["4top"]];
          break;
        case "3top":
          numbers = [yiKee4GResults["3top"]];
          break;
        case "3toad":
          numbers = yiKee4GResults["3toad"];
          break;
        case "2top":
          numbers = [yiKee4GResults["2top"]];
          break;
        case "2bottom":
          numbers = [yiKee4GResults["2bottom"]];
          break;
        case "1top":
          numbers = yiKee4GResults["1top"];
          break;
        case "1bottom":
          numbers = yiKee4GResults["1bottom"];
          break;
      }

      if (numbers.length > 0) {
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

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยยี่กี 4G"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(
      `🏆 ประมวลผลหวยยี่กี 4G เสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`
    );

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processLotteryYiKee4G error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับประมวลผลหวยยี่กี 5G
async function processLotteryYiKee5G(
  lottery_set_id,
  createdBy,
  lottery_set,
  lottery_type
) {
  try {
    console.log("🎲 เริ่มประมวลผลหวยยี่กี 5G");

    // 1. สร้างเลขผลออกแบบ random (5 หลัก)
    const mainNumber = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    console.log("🎯 เลขที่ออก:", mainNumber);

    const yiKee5GResults = {
      mainNumber: mainNumber,
      "5top": mainNumber,
      "4top": mainNumber.slice(-4),
      "3top": mainNumber.slice(-3),
      "3toad": generateToadNumbers(mainNumber.slice(-3)),
      "2top": mainNumber.slice(-2),
      "2bottom": mainNumber.slice(-2),
      "1top": mainNumber.slice(-3).split(""),
      "1bottom": mainNumber.slice(-2).split(""),
    };

    // บันทึกผลลงในตาราง huay
    await saveYiKeeResultsToHuay(lottery_set_id, yiKee5GResults, "หวยยี่กี 5G");

    // 2. สร้างผลหวยในระบบใหม่
    const lotteryResult = await LotteryResult.create({
      lottery_set_id,
      draw_date: new Date(),
      status: "published",
      createdBy,
    });

    // 3. บันทึกรายการรางวัลตาม betting_types
    const resultItems = [];

    for (const betType of lottery_type.betting_types) {
      let numbers = [];

      switch (betType.code) {
        case "5top":
          numbers = [yiKee5GResults["5top"]];
          break;
        case "4top":
          numbers = [yiKee5GResults["4top"]];
          break;
        case "3top":
          numbers = [yiKee5GResults["3top"]];
          break;
        case "3toad":
          numbers = yiKee5GResults["3toad"];
          break;
        case "2top":
          numbers = [yiKee5GResults["2top"]];
          break;
        case "2bottom":
          numbers = [yiKee5GResults["2bottom"]];
          break;
        case "1top":
          numbers = yiKee5GResults["1top"];
          break;
        case "1bottom":
          numbers = yiKee5GResults["1bottom"];
          break;
      }

      if (numbers.length > 0) {
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

    // 4. หาผู้ใช้ที่ยังไม่ถูกตรวจและตรวจรางวัล
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    // 5. ตรวจรางวัลและบันทึกผู้ชนะ
    const winners = await processLotteryWinners(
      pendingBets,
      resultItems,
      lottery_set_id,
      "หวยยี่กี 5G"
    );

    await LotterySets.findByIdAndUpdate(lottery_set_id, { status: "resulted" });
    console.log(
      `🏆 ประมวลผลหวยยี่กี 5G เสร็จสิ้น พบผู้ชนะ ${winners.length} รายการ`
    );

    return {
      lottery_result: lotteryResult,
      result_items: resultItems,
      winners: winners,
    };
  } catch (error) {
    console.error("❌ processLotteryYiKee5G error:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับบันทึกผลหวยยี่กีลงในตาราง huay
async function saveYiKeeResultsToHuay(
  lottery_set_id,
  yiKeeResults,
  type = "หวยยี่กี"
) {
  try {
    const huayData = [];

    // บันทึกผลตามประเภทหวยยี่กี
    if (type === "หวยยี่กี") {
      huayData.push(
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวบน",
          code: "3top",
          name: "yi-kee",
          huay_number: [yiKeeResults["3top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวโต๊ด",
          code: "3toad",
          name: "yi-kee",
          huay_number: yiKeeResults["3toad"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวบน",
          code: "2top",
          name: "yi-kee",
          huay_number: [yiKeeResults["2top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวล่าง",
          code: "2bottom",
          name: "yi-kee",
          huay_number: [yiKeeResults["2bottom"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งบน",
          code: "1top",
          name: "yi-kee",
          huay_number: yiKeeResults["1top"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งล่าง",
          code: "1bottom",
          name: "yi-kee",
          huay_number: yiKeeResults["1bottom"],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    } else if (type === "หวยยี่กี 4G") {
      huayData.push(
        {
          lottery_set_id: lottery_set_id,
          huay_name: "4 ตัวบน",
          code: "4top",
          name: "yi-kee-4g",
          huay_number: [yiKeeResults["4top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวบน",
          code: "3top",
          name: "yi-kee-4g",
          huay_number: [yiKeeResults["3top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวโต๊ด",
          code: "3toad",
          name: "yi-kee-4g",
          huay_number: yiKeeResults["3toad"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวบน",
          code: "2top",
          name: "yi-kee-4g",
          huay_number: [yiKeeResults["2top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวล่าง",
          code: "2bottom",
          name: "yi-kee-4g",
          huay_number: [yiKeeResults["2bottom"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งบน",
          code: "1top",
          name: "yi-kee-4g",
          huay_number: yiKeeResults["1top"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งล่าง",
          code: "1bottom",
          name: "yi-kee-4g",
          huay_number: yiKeeResults["1bottom"],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    } else if (type === "หวยยี่กี 5G") {
      huayData.push(
        {
          lottery_set_id: lottery_set_id,
          huay_name: "5 ตัวบน",
          code: "5top",
          name: "yi-kee-5g",
          huay_number: [yiKeeResults["5top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "4 ตัวบน",
          code: "4top",
          name: "yi-kee-5g",
          huay_number: [yiKeeResults["4top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวบน",
          code: "3top",
          name: "yi-kee-5g",
          huay_number: [yiKeeResults["3top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "3 ตัวโต๊ด",
          code: "3toad",
          name: "yi-kee-5g",
          huay_number: yiKeeResults["3toad"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวบน",
          code: "2top",
          name: "yi-kee-5g",
          huay_number: [yiKeeResults["2top"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "2 ตัวล่าง",
          code: "2bottom",
          name: "yi-kee-5g",
          huay_number: [yiKeeResults["2bottom"]],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งบน",
          code: "1top",
          name: "yi-kee-5g",
          huay_number: yiKeeResults["1top"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          lottery_set_id: lottery_set_id,
          huay_name: "วิ่งล่าง",
          code: "1bottom",
          name: "yi-kee-5g",
          huay_number: yiKeeResults["1bottom"],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    // บันทึกข้อมูลลงในตาราง huay
    if (huayData.length > 0) {
      await huay.insertMany(huayData);
      console.log(`✅ บันทึกผล${type}ลงในตาราง huay เรียบร้อย`);
    }

    return huayData;
  } catch (error) {
    console.error(`❌ Error saving ${type} results to huay:`, error.message);
    throw error;
  }
}
