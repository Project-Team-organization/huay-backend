const axios = require("axios");
const LotteryMagnum4d = require("../../models/lottery_magnum_4d.model");

const fetchAndSaveMagnum4dLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryMagnum4d.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/magnum-4d/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (!data.results.first_prize || data.results.first_prize === "xxxx") {
      throw new Error(
        `Failed to fetch and save Magnum 4D lottery: หวย Magnum 4D วันนี้ยังไม่ออกผล`
      );
    }

    // ➤ รวมรางวัลทั้งหมดเพื่อใช้ในการสร้าง betting types
    const allPrizes = [
      data.results.first_prize,
      data.results.second_prize,
      data.results.third_prize,
      ...data.results.special_prizes,
      ...data.results.consolation_prizes
    ];

    // ➤ หา 4 ตัว (จากรางวัลที่ 1)
    let fourDigit = "";
    if (data.results.first_prize) {
      fourDigit = data.results.first_prize;
    }

    // ➤ หา 3 ตัวบน (3 หลักท้ายของรางวัลที่ 1)
    let threeTop = "";
    if (data.results.first_prize && data.results.first_prize.length >= 3) {
      threeTop = data.results.first_prize.slice(-3);
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

    // ➤ หา 2 ตัวบน (2 หลักท้ายของรางวัลที่ 1)
    let twoTop = "";
    if (data.results.first_prize && data.results.first_prize.length >= 2) {
      twoTop = data.results.first_prize.slice(-2);
    }

    // ➤ หา 2 ตัวล่าง (2 หลักหน้าของรางวัลที่ 1)
    let twoBottom = "";
    if (data.results.first_prize && data.results.first_prize.length >= 2) {
      twoBottom = data.results.first_prize.slice(0, 2);
    }
    
    // ➤ 1 ตัวบน (วิ่งบน จาก 3 ตัวบน)
    let oneTop = "";
    if (threeTop && threeTop.length === 3) {
      oneTop = threeTop.split("").join(","); // เช่น "676" → "6,7,6"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก 2 ตัวล่าง)
    let oneBottom = "";
    if (twoBottom && twoBottom.length === 2) {
      oneBottom = twoBottom.split("").join(","); // เช่น "26" → "2,6"
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title || "Magnum 4D",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      draw_number: data.draw_number,
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
          code: "4digit",
          name: "4 ตัว",
          digit: fourDigit,
        },
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

    const lottery = new LotteryMagnum4d(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Magnum 4D lottery: ${error.message}`);
  }
};

const getAllMagnum4dLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryMagnum4d.countDocuments(query);

    // Get data with pagination
    const data = await LotteryMagnum4d.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllMagnum4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวย Magnum 4D");
  }
};

module.exports = {
  fetchAndSaveMagnum4dLottery,
  getAllMagnum4dLottery,
};
