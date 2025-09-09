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

    const firstPrize = data.results.first_prize?.match(/\d+/)?.[0] || "";
    const secondPrize = data.results.second_prize?.match(/\d+/)?.[0] || "";
    const thirdPrize = data.results.third_prize?.match(/\d+/)?.[0] || "";

    const firstPrize3d = firstPrize.slice(-3);
    const secondPrize3d = secondPrize.slice(-3);
    const thirdPrize3d = thirdPrize.slice(-3);

    const firstPrize2d = firstPrize.slice(-2);
    const secondPrize2d = secondPrize.slice(-2);
    const thirdPrize2d = thirdPrize.slice(-2);

    const specialPrizes = data.results.special_prizes || [];
    const consolationPrizes = data.results.consolation_prizes || [];

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
          code: "a1_4d",
          name: "4 ตัวบน",
          digit: firstPrize ? [firstPrize] : [],
        },
        {
          code: "b1_4d",
          name: "4 ตัวล่าง",
          digit: secondPrize ? [secondPrize] : [],
        },
        {
          code: "c1_4d",
          name: "4 ตัวล่าง",
          digit: thirdPrize ? [thirdPrize] : [],
        },
        {
          code: "b_3d",
          name: "3 ตัวบน",
          digit: firstPrize3d ? [firstPrize3d] : [],
        },
        {
          code: "c_3d",
          name: "3 ตัวล่าง",
          digit: secondPrize3d ? [secondPrize3d] : [],
        },
        {
          code: "abc_n_3d",
          name: "3 ตัวล่าง",
          digit: thirdPrize3d ? [thirdPrize3d] : [],
        },
        {
          code: "a_3d",
          name: "3 ตัวรวม",
          digit: [firstPrize3d, secondPrize3d, thirdPrize3d].filter(digit => digit !== ""),
        },
        {
          code: "small_4d",
          name: "เล็ก",
          digit: [firstPrize, secondPrize, thirdPrize].filter(digit => digit !== ""),
        },
        {
          code: "big_4d",
          name: "ใหญ่",
          digit: [firstPrize, secondPrize, thirdPrize, ...specialPrizes, ...consolationPrizes].filter(digit => digit !== ""),
        },
        {
          code: "pack_5",
          name: "5 เด้ง",
          digit: [
            // small_4d
            firstPrize, secondPrize, thirdPrize,
            // big_4d
            firstPrize, secondPrize, thirdPrize, ...specialPrizes, ...consolationPrizes,
            // abc_n_3d
            thirdPrize3d,
            // a1_4d
            firstPrize,
            // a_3d
            firstPrize3d, secondPrize3d, thirdPrize3d,
          ].filter(digit => digit !== ""),
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
