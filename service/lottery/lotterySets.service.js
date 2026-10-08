const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const BettingType = require("../../models/bettingTypes.model");
const huay = require("../../models/huay.model");
const mongoose = require("mongoose");
const huayService = require("./huay.service");
const axios = require("axios");

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
    const { status, limit, page = 1, slug, name } = query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    // เพิ่มการค้นหาตาม name (ถ้ามี)
    if (name) {
      filter.name = name; // ค้นหาแบบตรงทุกอักษร
    }

    let lotterySets = await LotterySets.find(filter)
      .skip((parseInt(page) - 1) * (limit ? parseInt(limit) : 0))
      .limit(limit ? parseInt(limit) : undefined)
      .sort({ openTime: -1 }) // เรียงตามเวลาเปิดล่าสุดก่อน
      .populate("lottery_type_id");

    if (slug) {
      lotterySets = lotterySets.filter(
        lottery => lottery.lottery_type_id?.slug === slug
      );
    }

    const totalItems = await LotterySets.countDocuments(filter);

    return {
      data: lotterySets,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limit ? parseInt(limit) : null,
        totalPages: limit ? Math.ceil(totalItems / parseInt(limit)) : 1,
      },
    };
  } catch (error) {
    throw new Error("Error retrieving lottery sets: " + error.message);
  }
};

exports.getLotteryById = async function (lotteryId) {
  try {
    const lottery = await LotterySets.findById(lotteryId).populate(
      "lottery_type_id"
    );

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
    ).populate("lottery_type_id");

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
  // if (data.name) {
  //   const query = { name: data.name };
  //   // ถ้าเป็นการอัพเดท ไม่เช็คกับข้อมูลของตัวเอง
  //   if (lotteryId) {
  //     query._id = { $ne: lotteryId };
  //   }
  //   const existingLottery = await LotterySets.findOne(query);
  //   if (existingLottery) {
  //     throw new Error("ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น");
  //   }
  // }

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
    // เพิ่มการตรวจสอบสำหรับกรณีที่เวลาข้ามวัน (เช่น หวยลาว Extra ที่สร้างตอนบ่ายแต่ออกผลเช้าวันถัดไป)
    const timeDifference = closeTime.getTime() - openTime.getTime();
    if (timeDifference <= 0) {
      // ถ้าผลต่างเป็นลบหรือเท่ากับ 0 แสดงว่าเวลาปิดไม่ได้มากกว่าเวลาเปิด
      console.log("⚠️ การตรวจสอบเวลา:");
      console.log(
        "เวลาเปิด:",
        openTime.toISOString(),
        "(ไทย:",
        openTime.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        ")"
      );
      console.log(
        "เวลาปิด:",
        closeTime.toISOString(),
        "(ไทย:",
        closeTime.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        ")"
      );
      console.log("ผลต่าง (ชั่วโมง):", timeDifference / (1000 * 60 * 60));
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

  const uniqueIds = [...new Set(ids.map(id => id.toString()))];

  for (let i = 0; i < uniqueIds.length; i++) {
    if (!mongoose.Types.ObjectId.isValid(uniqueIds[i]))
      throw new Error(`Invalid betting_type_id format: ${uniqueIds[i]}`);
  }

  const found = await BettingType.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();
  const foundIds = new Set(found.map(f => f._id.toString()));

  uniqueIds.forEach(id => {
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
      throw new Error(
        "No prize or runningNumbers data found from external API."
      );
    }

    const huayData = [];

    const prizeFirst = data.prizes.find(prize => prize.id === "prizeFirst");
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
      prize => prize.id === "prizeFrontThree"
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
        .filter(running => Array.isArray(running.number))
        .map(running => ({
          lottery_set_id,
          huay_name: running.name,
          huay_number: running.number,
        }))
    );

    const frontThreeItem = huayData.find(
      item => item.huay_name === "รางวัลเลขหน้า 3 ตัว"
    );
    if (frontThreeItem) {
      huayData.push(
        ...getTodFrontThreeFromHuayData(frontThreeItem, lottery_set_id)
      );
    }

    const backThreeItem = huayData.find(
      item => item.huay_name === "รางวัลเลขท้าย 3 ตัว"
    );
    if (backThreeItem) {
      huayData.push(
        ...getTodBackThreeFromHuayData(backThreeItem, lottery_set_id)
      );
    }

    const twoDigitItem = huayData.find(
      item => item.huay_name === "รางวัลเลขท้าย 2 ตัว"
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
    console.log("สร้างผลหวยสำเร็จ");
    return await huayService.create(updatedHuayData, lottery_set_id);
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
      status: "scheduled", // เช็คเฉพาะที่มีสถานะ scheduled
    })
      .sort({ openTime: -1 })
      .populate("lottery_type_id");

    if (openLotterySets.length > 0) {
      for (const lotterySet of openLotterySets) {
        try {
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "open",
          });
          console.log(`🎲 เปิดรับแทงหวย: ${lotterySet.name}`);
        } catch (error) {
          console.error(
            `Error opening lottery set ${lotterySet._id}:`,
            error.message
          );
        }
      }
    }

    //ปิดหวยอัตโนมัติ
    const closeLotterySets = await LotterySets.find({
      closeTime: { $lte: serverTime },
      status: "open", // เช็คเฉพาะที่เปิดอยู่
    })
      .sort({ openTime: -1 })
      .populate("lottery_type_id");

    if (closeLotterySets.length > 0) {
      for (const lotterySet of closeLotterySets) {
        try {
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "closed",
          });
          console.log(`🔒 ปิดรับแทงหวย: ${lotterySet.name}`);
        } catch (error) {
          console.error(
            `Error closing lottery set ${lotterySet._id}:`,
            error.message
          );
        }
      }
    }

    // ออกผลหวยยี่กีอัตโนมัติ (เปลี่ยนเฉพาะยี่กีที่ออกผลเองเป็น Auto ส่วนหวยอื่นยังคงเป็น Manual)
    const readyLotterySets = await LotterySets.find({
      result_time: { $lte: serverTime },
      status: {
        $nin: ["resulted", "cancelled"], // ไม่เอาสถานะ resulted และ cancelled
      },
      name: { $regex: /ยี่กี|ยิกี/ } // ดึงเฉพาะหวยตระกูลยี่กี
    }).sort({ openTime: -1 });

    if (readyLotterySets.length > 0) {
      const user_id = "685d483a2144647be58f9312";

      // Process each lottery set
      for (const lotterySet of readyLotterySets) {
        try {
          console.log(`🔍 ออกผลหวยยี่กีอัตโนมัติ: ${lotterySet.name}`);
          await huayService.evaluateUserBetsByLotterySet(
            lotterySet._id,
            user_id
          );

          // อัพเดทสถานะเป็น resulted
          await LotterySets.findByIdAndUpdate(lotterySet._id, {
            status: "resulted",
          });

          console.log(`🔍 ประมวลผลรางวัลหวยยี่กีสำเร็จ: ${lotterySet.name}`);
        } catch (error) {
          console.error(
            `Error processing automatic YiKee lottery set ${lotterySet._id}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking lottery set results:", error);
  }
}

const renameHuayNamesAsync = async huayData => {
  try {
    const mapping = {
      "รางวัลเลขหน้า 3 ตัว": "3 ตัวหน้า",
      "รางวัลเลขท้าย 3 ตัว": "3 ตัวล่าง",
      "รางวัลเลขท้าย 2 ตัว": "2 ตัวล่าง",
    };

    return huayData.map(item => {
      const newName = mapping[item.huay_name] || item.huay_name;
      const newItem = {
        ...item,
        huay_name: newName,
      };

      if (newName === "2 ตัวล่าง") {
        newItem.code = "2d_bottom";
      }
      if (newName === "3 ตัวล่าง") {
        newItem.code = "3d_bottom";
      }
      if (newName === "3 ตัวหน้า") {
        newItem.code = "3d_front_2";
      }

      return newItem;
    });
  } catch (error) {
    console.error("renameHuayNamesAsync error:", error);
    return huayData;
  }
};

const getFrontThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map(fullNumber => ({
      lottery_set_id,
      huay_name: "3 ตัวหน้ารางวัลที่ 1",
      huay_number: [fullNumber.slice(0, 3)],
      code: "3d_front",
    }));
  } catch (error) {
    console.error("getFrontThreeFromFirstPrize error:", error);
    return [];
  }
};

const getLastFourFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map(fullNumber => ({
      lottery_set_id,
      huay_name: "4 ตัวบน",
      huay_number: [fullNumber.slice(-4)],
      code: "4d_top",
    }));
  } catch (error) {
    console.error("getLastFourFromFirstPrize error:", error);
    return [];
  }
};

const getLastTwoFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map(fullNumber => ({
      lottery_set_id,
      huay_name: "2 ตัวบน",
      huay_number: [fullNumber.slice(-2)],
      code: "2d_top",
    }));
  } catch (error) {
    console.error("getLastTwoFromFirstPrize error:", error);
    return [];
  }
};

const getTodThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    function generateTod3Permutations(numberStr) {
      if (!numberStr || numberStr.length !== 3) return [];

      const [a, b, c] = numberStr.split("");
      return [a + b + c, a + c + b, b + a + c, b + c + a, c + a + b, c + b + a];
    }

    const allPermutations = prizeFirst.number.flatMap(fullNumber => {
      const lastThree = fullNumber.slice(-3);
      return generateTod3Permutations(lastThree);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "3 ตัวโต๊ดหลังรางวัลที่ 1",
        huay_number: uniquePermutations,
        code: "3d_toot",
      },
    ];
  } catch (error) {
    console.error("getTodThreeFromFirstPrize error:", error);
    return [];
  }
};

const getTodFrontThreeFromHuayData = (huayDataItem, lottery_set_id) => {
  try {
    if (!huayDataItem || !Array.isArray(huayDataItem.huay_number)) return [];
    console.log("Input huay_number:", huayDataItem.huay_number);

    const generatePermutations = str => {
      const results = new Set();
      const arr = str.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allTodNumbers = huayDataItem.huay_number.flatMap(num =>
      generatePermutations(num)
    );
    const uniqueTodNumbers = [...new Set(allTodNumbers)];

    return [
      {
        lottery_set_id,
        huay_name: "3 ตัวโต๊ดหน้า",
        huay_number: uniqueTodNumbers,
        code: "3d_front_toot_2",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromHuayData error:", error);
    return [];
  }
};

const getTodBackThreeFromHuayData = (huayDataItem, lottery_set_id) => {
  try {
    if (!huayDataItem || !Array.isArray(huayDataItem.huay_number)) return [];
    console.log("Input huay_number:", huayDataItem.huay_number);

    const generatePermutations = str => {
      const results = new Set();
      const arr = str.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allTodNumbers = huayDataItem.huay_number.flatMap(num =>
      generatePermutations(num)
    );
    const uniqueTodNumbers = [...new Set(allTodNumbers)];

    return [
      {
        lottery_set_id,
        huay_name: "3 ตัวโต๊ดล่าง",
        huay_number: uniqueTodNumbers,
        code: "3d_bottom_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromHuayData error:", error);
    return [];
  }
};

const getLastFiveFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map(fullNumber => ({
      lottery_set_id,
      huay_name: "5 ตัวบน",
      huay_number: [fullNumber.slice(-5)],
      code: "5d_top",
    }));
  } catch (error) {
    console.error("getLastFiveFromFirstPrize error:", error);
    return [];
  }
};

const getTodFourFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const generateTod4Permutations = numberStr => {
      if (!numberStr || numberStr.length !== 4) return [];

      const results = new Set();
      const arr = numberStr.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allPermutations = prizeFirst.number.flatMap(fullNumber => {
      const lastFour = fullNumber.slice(-4);
      return generateTod4Permutations(lastFour);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "4 ตัวโต๊ด",
        huay_number: uniquePermutations,
        code: "4d_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFourFromFirstPrize error:", error);
    return [];
  }
};

const getTodFrontThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const generateTod3Permutations = numberStr => {
      if (!numberStr || numberStr.length !== 3) return [];

      const results = new Set();
      const arr = numberStr.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allPermutations = prizeFirst.number.flatMap(fullNumber => {
      const frontThree = fullNumber.slice(0, 3);
      return generateTod3Permutations(frontThree);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "3 ตัวโต๊ดหน้ารางวัลที่ 1",
        huay_number: uniquePermutations,
        code: "3d_front_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromFirstPrize error:", error);
    return [];
  }
};

const getTopThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map(fullNumber => ({
      lottery_set_id,
      huay_name: "3 ตัวบน",
      huay_number: [fullNumber.slice(-3)],
      code: "3d_top",
    }));
  } catch (error) {
    console.error("getTopThreeFromFirstPrize error:", error);
    return [];
  }
};

const getOneTopFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const digitSet = new Set();

    prizeFirst.number.forEach(fullNumber => {
      const lastThree = fullNumber.slice(-3);
      lastThree.split("").forEach(digit => digitSet.add(digit));
    });

    return [
      {
        lottery_set_id,
        huay_name: "วิ่งบน",
        huay_number: [...digitSet],
        code: "1top",
      },
    ];
  } catch (error) {
    console.error("getOneTopFromFirstPrize error:", error);
    return [];
  }
};

const getOneBottomFromFirstPrize = (twoDigitItem, lottery_set_id) => {
  try {
    if (!twoDigitItem || !Array.isArray(twoDigitItem.huay_number)) return [];

    const digitSet = new Set();
    twoDigitItem.huay_number.forEach(number => {
      number.split("").forEach(digit => digitSet.add(digit));
    });

    return [
      {
        lottery_set_id,
        huay_name: "วิ่งล่าง",
        huay_number: [...digitSet],
        code: "1bottom",
      },
    ];
  } catch (error) {
    console.error("getOneBottomFromFirstPrize error:", error);
    return [];
  }
};
exports.checkLotterySetResults = checkLotterySetResults;
