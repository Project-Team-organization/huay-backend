const axios = require("axios");
const LotteryGrandDragon4d = require("../../models/lottery_grand_dragon_4d.model");

const fetchAndSaveGrandDragon4dLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryGrandDragon4d.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/grand-dragon-4d/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (!data.results.first_prize || data.results.first_prize === "xxxx") {
      throw new Error(
        `Failed to fetch and save Grand Dragon 4D lottery: หวย Grand Dragon 4D วันนี้ยังไม่ออกผล`
      );
    }

    // ➤ หา 3 ตัวบน (จาก first prize)
    let threeTop = "";
    if (data.results.first_prize) {
      // เอาเฉพาะตัวเลขจาก "(C) 6000" → "6000" → "000"
      const firstPrizeDigits = data.results.first_prize.match(/\d+/);
      if (firstPrizeDigits && firstPrizeDigits[0].length >= 3) {
        threeTop = firstPrizeDigits[0].slice(-3); // เอา 3 ตัวท้าย
      }
    }
    
    // ➤ หา 3 ตัวโต๊ด
    let threeToad = [];
    if (threeTop) {
      const digits = threeTop.split("");
      const perms = new Set();

      const permute = (arr, m = []) => {
        if (arr.length === 0) {
          perms.add(m.join(""));
        } else {
          for (let i = 0; i < arr.length; i++) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next));
          }
        }
      };

      permute(digits);
      threeToad = [...perms];
    }

    // ➤ หา 2 ตัวบน (จาก first prize)
    let twoTop = "";
    if (data.results.first_prize) {
      const firstPrizeDigits = data.results.first_prize.match(/\d+/);
      if (firstPrizeDigits && firstPrizeDigits[0].length >= 2) {
        twoTop = firstPrizeDigits[0].slice(-2); // เอา 2 ตัวท้าย
      }
    }

    // ➤ หา 2 ตัวล่าง (จาก second prize)
    let twoBottom = "";
    if (data.results.second_prize) {
      const secondPrizeDigits = data.results.second_prize.match(/\d+/);
      if (secondPrizeDigits && secondPrizeDigits[0].length >= 2) {
        twoBottom = secondPrizeDigits[0].slice(-2); // เอา 2 ตัวท้าย
      }
    }
    
    // ➤ 1 ตัวบน (วิ่งบน จาก first prize)
    let oneTop = "";
    if (data.results.first_prize) {
      const firstPrizeDigits = data.results.first_prize.match(/\d+/);
      if (firstPrizeDigits && firstPrizeDigits[0].length >= 3) {
        const digits = firstPrizeDigits[0].slice(-3).split("");
        oneTop = digits.join(","); // เช่น "000" → "0,0,0"
      }
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก second prize)
    let oneBottom = "";
    if (data.results.second_prize) {
      const secondPrizeDigits = data.results.second_prize.match(/\d+/);
      if (secondPrizeDigits && secondPrizeDigits[0].length >= 2) {
        const digits = secondPrizeDigits[0].slice(-2).split("");
        oneBottom = digits.join(","); // เช่น "06" → "0,6"
      }
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title || "หวย Grand Dragon 4D",
      lotto_date: data.lotto_date,
      draw_number: data.draw_number,
      lottery_name: data.lotteryName,
      scraper: data.scraper,
      scrapedAt: data.scrapedAt,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        first_prize: data.results.first_prize,
        second_prize: data.results.second_prize,
        third_prize: data.results.third_prize,
        special_prizes: data.results.special_prizes,
        consolation_prizes: data.results.consolation_prizes,
      },
      betting_types: [
        {
          code: "3top",
          name: "3 ตัวบน",
          digit: threeTop,
        },
        {
          code: "3toad",
          name: "3 ตัวโต๊ด",
          digit: threeToad.join(","),
        },
        {
          code: "2top",
          name: "2 ตัวบน",
          digit: twoTop,
        },
        {
          code: "2bottom",
          name: "2 ตัวล่าง",
          digit: twoBottom,
        },
        {
          code: "1top",
          name: "วิ่งบน",
          digit: oneTop,
        },
        {
          code: "1bottom",
          name: "วิ่งล่าง",
          digit: oneBottom,
        },
      ],
    };

    const lottery = new LotteryGrandDragon4d(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Grand Dragon 4D lottery: ${error.message}`);
  }
};

const getAllGrandDragon4dLottery = async ({ page, limit, startDate, endDate }) => {
  try {
    const query = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await LotteryGrandDragon4d.countDocuments(query);

    // Get data with pagination
    const data = await LotteryGrandDragon4d.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllGrandDragon4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวย Grand Dragon 4D");
  }
};

// ดึงข้อมูลหวย Grand Dragon 4D ตาม ID
const getGrandDragon4dLotteryById = async (id) => {
  try {
    const lottery = await LotteryGrandDragon4d.findById(id);
    return lottery;
  } catch (error) {
    console.error("Error in getGrandDragon4dLotteryById service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวย Grand Dragon 4D");
  }
};

// ลบข้อมูลหวย Grand Dragon 4D ตาม ID
const deleteGrandDragon4dLottery = async (id) => {
  try {
    const lottery = await LotteryGrandDragon4d.findByIdAndDelete(id);
    return lottery;
  } catch (error) {
    console.error("Error in deleteGrandDragon4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการลบข้อมูลหวย Grand Dragon 4D");
  }
};

// อัพเดทข้อมูลหวย Grand Dragon 4D ตาม ID
const updateGrandDragon4dLottery = async (id, updateData) => {
  try {
    const lottery = await LotteryGrandDragon4d.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    return lottery;
  } catch (error) {
    console.error("Error in updateGrandDragon4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวย Grand Dragon 4D");
  }
};

// สร้างข้อมูลหวย Grand Dragon 4D ใหม่
const createGrandDragon4dLottery = async (lotteryData) => {
  try {
    const lottery = new LotteryGrandDragon4d(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    console.error("Error in createGrandDragon4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างข้อมูลหวย Grand Dragon 4D");
  }
};

module.exports = {
  fetchAndSaveGrandDragon4dLottery,
  getAllGrandDragon4dLottery,
  getGrandDragon4dLotteryById,
  deleteGrandDragon4dLottery,
  updateGrandDragon4dLottery,
  createGrandDragon4dLottery,
};
