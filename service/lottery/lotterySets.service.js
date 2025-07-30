const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const BettingType = require("../../models/bettingTypes.model");
const huay = require("../../models/huay.model");
const mongoose = require("mongoose");
const huayService = require("./huay.service");
const axios = require("axios");

// Helper functions for transforming huay data
function getFrontThreeFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(0, 3);
  return [{
    lottery_set_id,
    huay_name: "เลขหน้า 3 ตัว",
    huay_number: [number],
    code: "3d_top"
  }];
}

function getLastFourFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(2);
  return [{
    lottery_set_id,
    huay_name: "เลขท้าย 4 ตัว",
    huay_number: [number],
    code: "4d_bottom"
  }];
}

function getLastTwoFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(4);
  return [{
    lottery_set_id,
    huay_name: "เลขท้าย 2 ตัว",
    huay_number: [number],
    code: "2d_bottom"
  }];
}

function getTodThreeFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(3);
  return [{
    lottery_set_id,
    huay_name: "โต๊ดเลขท้าย 3 ตัว",
    huay_number: [number],
    code: "3d_tod"
  }];
}

function getLastFiveFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(1);
  return [{
    lottery_set_id,
    huay_name: "เลขท้าย 5 ตัว",
    huay_number: [number],
    code: "5d_bottom"
  }];
}

function getTodFourFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(2);
  return [{
    lottery_set_id,
    huay_name: "โต๊ดเลขท้าย 4 ตัว",
    huay_number: [number],
    code: "4d_tod"
  }];
}

function getTodFrontThreeFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(0, 3);
  return [{
    lottery_set_id,
    huay_name: "โต๊ดเลขหน้า 3 ตัว",
    huay_number: [number],
    code: "3d_top_tod"
  }];
}

function getTopThreeFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(0, 3);
  return [{
    lottery_set_id,
    huay_name: "เลขหน้า 3 ตัว",
    huay_number: [number],
    code: "3d_top"
  }];
}

function getOneTopFromFirstPrize(prizeFirst, lottery_set_id) {
  if (!prizeFirst.number[0]) return [];
  const number = prizeFirst.number[0].substring(0, 1);
  return [{
    lottery_set_id,
    huay_name: "เลขหน้า 1 ตัว",
    huay_number: [number],
    code: "1d_top"
  }];
}

function getTodFrontThreeFromHuayData(frontThreeItem, lottery_set_id) {
  return [{
    lottery_set_id,
    huay_name: "โต๊ดเลขหน้า 3 ตัว",
    huay_number: frontThreeItem.huay_number,
    code: "3d_top_tod"
  }];
}

function getTodBackThreeFromHuayData(backThreeItem, lottery_set_id) {
  return [{
    lottery_set_id,
    huay_name: "โต๊ดเลขท้าย 3 ตัว",
    huay_number: backThreeItem.huay_number,
    code: "3d_tod"
  }];
}

function getOneBottomFromFirstPrize(twoDigitItem, lottery_set_id) {
  if (!twoDigitItem.huay_number[0]) return [];
  const number = twoDigitItem.huay_number[0].substring(1);
  return [{
    lottery_set_id,
    huay_name: "เลขท้าย 1 ตัว",
    huay_number: [number],
    code: "1d_bottom"
  }];
}

async function renameHuayNamesAsync(huayData) {
  return huayData.map(item => {
    switch (item.huay_name) {
      case "รางวัลที่ 1":
        return { ...item, huay_name: "เลขรางวัลที่ 1" };
      case "เลขหน้า 3 ตัว":
        return { ...item, huay_name: "เลขหน้า 3 ตัว" };
      case "เลขท้าย 3 ตัว":
        return { ...item, huay_name: "เลขท้าย 3 ตัว" };
      case "เลขท้าย 2 ตัว":
        return { ...item, huay_name: "เลขท้าย 2 ตัว" };
      default:
        return item;
    }
  });
}

exports.createLotterySets = async function (data) {
  try {
    await validateInput(data);
    await validateLotteryType(data.lottery_type_id);
    // await validateBettingOptionsAndIds(data.betting_options);

    const createdSet = await LotterySets.create(data);

    return createdSet;
  } catch (error) {
    console.error("Error creating lottery sets:", error.message);
    throw error;
  }
};

exports.getLotterySets = async function (query) {
  try {
    const { status, limit = 10, page = 1, slug } = query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    let lotterySets = await LotterySets.find(filter)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("lottery_type_id")

    if (slug) {
      lotterySets = lotterySets.filter(
        (lottery) => lottery.lottery_type_id?.slug === slug
      );
    }

    const totalItems = await LotterySets.countDocuments(filter);

    return {
      data: lotterySets,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
      },
    };
  } catch (error) {
    throw new Error("Error retrieving lottery sets: " + error.message);
  }
};

exports.getLotteryById = async function (lotteryId) {
  try {
    const lottery = await LotterySets.findById(lotteryId).populate("lottery_type_id");

    if (!lottery) {
      throw new Error("LotterySets not found.");
    }

    return lottery;
  } catch (error) {
    throw new Error("Error retrieving lotterySets: " + error.message);
  }
};

exports.updateLotterySets = async function (lotteryId, data) {
  try {
    await validateInput(data, lotteryId);
    const updatedDoc = await LotterySets.findByIdAndUpdate(
      lotteryId,
      { $set: data },
      { new: true }
    ).populate('lottery_type_id');

    if (!updatedDoc) {
      throw new Error("Lottery not found.");
    }

    return updatedDoc;
  } catch (error) {
    console.error("Error updating lottery item:", error.message);
    throw error;
  }
};

exports.deleteAllLottery = async function () {
  try {
    const deletedItems = await LotterySets.deleteMany();
    return deletedItems;
  } catch (error) {
    console.error("Error deleting all lottery Sets:", error.message);
    throw error;
  }
};

exports.deleteLottery = async function (lotteryId) {
  try {
    const deletedLottery = await LotterySets.findByIdAndDelete(lotteryId);
    if (!deletedLottery) {
      throw new Error("Lottery Sets not found.");
    }
    return deletedLottery;
  } catch (error) {
    console.error("Error deleting lottery Sets:", error.message);
    throw error;
  }
};

async function validateInput(data, lotteryId = null) {
  if (typeof data !== "object" || Array.isArray(data) || data === null) {
    throw new Error("Input must be a single object.");
  }

  if (!data.lottery_type_id) {
    throw new Error("lottery_type_id is required.");
  }

  // ตรวจสอบชื่อซ้ำ
  if (data.name) {
    const query = { name: data.name };
    // ถ้าเป็นการอัพเดท ไม่เช็คกับข้อมูลของตัวเอง
    if (lotteryId) {
      query._id = { $ne: lotteryId };
    }
    const existingLottery = await LotterySets.findOne(query);
    if (existingLottery) {
      throw new Error("ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น");
    }
  }

  // ตรวจสอบเวลา
  if (data.openTime && data.closeTime) {
    const currentDate = new Date();
    const openTime = new Date(data.openTime);
    const closeTime = new Date(data.closeTime);

    // ตรวจสอบว่า openTime ต้องมากกว่าเวลาปัจจุบัน
    // if (openTime <= currentDate) {
    //   throw new Error("เวลาเปิดต้องมากกว่าเวลาปัจจุบัน");
    // }

    // ตรวจสอบว่า closeTime ต้องมากกว่า openTime
    if (closeTime <= openTime) {
      throw new Error("เวลาปิดต้องมากกว่าเวลาเปิด");
    }
  }
}

async function validateLotteryType(lotteryTypeId) {
  const exists = await LotteryType.findById(lotteryTypeId);
  if (!exists) {
    throw new Error(`Lottery type not found: ${lotteryTypeId}`);
  }
}

async function validateBettingOptionsAndIds(options) {
  if (!Array.isArray(options))
    throw new Error("betting_options must be an array.");

  const errors = [];
  const ids = [];

  options.forEach(({ betting_type_id, payout_rate, min_bet, max_bet }, i) => {
    const missing = [];
    if (!betting_type_id) missing.push("betting_type_id");
    if (payout_rate == null) missing.push("payout_rate");
    if (min_bet == null) missing.push("min_bet");
    if (max_bet == null) missing.push("max_bet");

    if (missing.length)
      errors.push(`Index ${i} missing: ${missing.join(", ")}`);

    if (min_bet != null && max_bet != null && min_bet > max_bet)
      errors.push(`Index ${i}: min_bet cannot be greater than max_bet`);

    if (betting_type_id) ids.push(betting_type_id);
  });

  if (errors.length) throw new Error(errors.join(" | "));

  const uniqueIds = [...new Set(ids.map((id) => id.toString()))];

  for (let i = 0; i < uniqueIds.length; i++) {
    if (!mongoose.Types.ObjectId.isValid(uniqueIds[i]))
      throw new Error(`Invalid betting_type_id format: ${uniqueIds[i]}`);
  }

  const found = await BettingType.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();
  const foundIds = new Set(found.map((f) => f._id.toString()));

  uniqueIds.forEach((id) => {
    if (!foundIds.has(id)) errors.push(`betting_type_id not found: ${id}`);
  });

  if (errors.length) throw new Error(errors.join(" | "));
}

async function createHuayFromAPI(lottery_set_id) {
  try {
    if (!lottery_set_id) {
      throw new Error("Missing lottery_set_id.");
    }

    const response = await axios.get("https://lotto.api.rayriffy.com/latest");
    const data = response.data?.response;

    if (!data || !data.prizes || !data.runningNumbers) {
      throw new Error("No prize or runningNumbers data found from external API.");
    }

    const huayData = [];

    const prizeFirst = data.prizes.find((prize) => prize.id === "prizeFirst");
    if (prizeFirst && Array.isArray(prizeFirst.number)) {
      huayData.push({
        lottery_set_id,
        huay_name: prizeFirst.name,
        huay_number: prizeFirst.number,
        code: "6d_top",
      });

      huayData.push(
        ...getFrontThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastFourFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastTwoFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastFiveFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodFourFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodFrontThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTopThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getOneTopFromFirstPrize(prizeFirst, lottery_set_id)
      );
    }

    const prizeFrontThree = data.prizes.find(
      (prize) => prize.id === "prizeFrontThree"
    );
    if (prizeFrontThree && Array.isArray(prizeFrontThree.number)) {
      huayData.push({
        lottery_set_id,
        huay_name: "เลขหน้า 3 ตัว",
        huay_number: prizeFrontThree.number,
      });
    }

    huayData.push(
      ...data.runningNumbers
        .filter((running) => Array.isArray(running.number))
        .map((running) => ({
          lottery_set_id,
          huay_name: running.name,
          huay_number: running.number,
        }))
    );

    const frontThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขหน้า 3 ตัว"
    );
    if (frontThreeItem) {
      huayData.push(
        ...getTodFrontThreeFromHuayData(frontThreeItem, lottery_set_id)
      );
    }

    const backThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 3 ตัว"
    );
    if (backThreeItem) {
      huayData.push(
        ...getTodBackThreeFromHuayData(backThreeItem, lottery_set_id)
      );
    }

    const twoDigitItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 2 ตัว"
    );
    if (twoDigitItem) {
      huayData.push(
        ...getOneBottomFromFirstPrize(twoDigitItem, lottery_set_id)
      );
    }

    if (!huayData.length) {
      throw new Error("No valid huay data to insert.");
    }

    const updatedHuayData = await renameHuayNamesAsync(huayData);
    const result = await huayService.create(updatedHuayData, lottery_set_id);

    return result;
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    throw error;
  }
}

async function checkLotterySetResults() {
  try {
    // ใช้เวลาเซิร์ฟเวอร์ (UTC) โดยตรง
    const serverTime = new Date();
    // console.log('serverTime', serverTime);

    //เปิดหวยอัตโนมัติ
    const openLotterySets = await LotterySets.find({
      openTime: { $lte: serverTime },
      status: "scheduled" // เช็คเฉพาะที่มีสถานะ scheduled
    }).populate('lottery_type_id');

    if (openLotterySets.length > 0) {
      for (const lotterySet of openLotterySets) {
        try {
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "open"
          });
          console.log(`🎲 เปิดรับแทงหวย: ${lotterySet.name}`);
        } catch (error) {
          console.error(`Error opening lottery set ${lotterySet._id}:`, error.message);
        }
      }
    }

    //ปิดหวยอัตโนมัติ
    const closeLotterySets = await LotterySets.find({
      closeTime: { $lte: serverTime },
      status: "open" // เช็คเฉพาะที่เปิดอยู่
    }).populate('lottery_type_id');

    if (closeLotterySets.length > 0) {
      for (const lotterySet of closeLotterySets) {
        try {
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "closed"
          });
          console.log(`🔒 ปิดรับแทงหวย: ${lotterySet.name}`);
        } catch (error) {
          console.error(`Error closing lottery set ${lotterySet._id}:`, error.message);
        }
      }
    }

    // ออกผลหวย
    const readyLotterySets = await LotterySets.find({
      result_time: { $lte: serverTime },
      status: { 
        $nin: ["resulted", "cancelled"] // ไม่เอาสถานะ resulted และ cancelled
      }
    }).populate('lottery_type_id');

    if (readyLotterySets.length > 0) {
      const user_id = '685d483a2144647be58f9312';
      
      // Process each lottery set
      for (const lotterySet of readyLotterySets) {
        try {
          //ให้ไปเช็ค huayService ว่ามีข้อมูลหวยหรือยัง
          const huayData = await huay.find({lottery_set_id: lotterySet._id});
          if(huayData.length <= 0){
            console.log(`📥 ดึงข้อมูลหวยจาก API สำหรับ: ${lotterySet.name}`);
            await createHuayFromAPI(lotterySet._id);
            console.log(`✅ บันทึกข้อมูลหวยสำเร็จ: ${lotterySet.name}`);
          }

          console.log(`🔍 ออกผลหวย: ${lotterySet.name}`);
          await huayService.evaluateUserBetsByLotterySet(lotterySet._id, user_id);
          
          // อัพเดทสถานะเป็น resulted
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "resulted"
          });
          
          console.log(`🔍 ประมวลผลรางวัลสำเร็จ: ${lotterySet.name}`);
        } catch (error) {
          console.error(`Error processing lottery set ${lotterySet._id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error checking lottery set results:', error);
  }
}

exports.checkLotterySetResults = checkLotterySetResults;
