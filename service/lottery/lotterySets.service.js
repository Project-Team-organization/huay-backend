const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const BettingType = require("../../models/bettingTypes.model");
const mongoose = require("mongoose");
const huayService = require("./huay.service");

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

async function checkLotterySetResults() {
  try {
    const currentTime = new Date();
    
    //เปิดหวยอัตโนมัติ
    const openLotterySets = await LotterySets.find({
      openTime: { $lte: currentTime },
      closeTime: { $gt: currentTime }, // ต้องยังไม่ถึงเวลาปิด
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
      closeTime: { $lte: currentTime },
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
      result_time: { $lte: currentTime },
      status: { 
        $nin: ["resulted", "cancelled"] // ไม่เอาสถานะ resulted และ cancelled
      }
    }).populate('lottery_type_id');

    if (readyLotterySets.length > 0) {
      const user_id = '685d483a2144647be58f9312';
      
      // Process each lottery set
      for (const lotterySet of readyLotterySets) {
        try {
          // ประมวลผลรางวัลสำหรับแต่ละ lottery set
          console.log(`🔍 ออกผลหวย: ${lotterySet.name}`);
          await huayService.evaluateUserBetsByLotterySet(lotterySet._id, user_id);
          
          // อัพเดทสถานะเป็น resulted หลังจากประมวลผลเสร็จ
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
