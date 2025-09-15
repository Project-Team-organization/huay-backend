const axios = require("axios");
const LotterySingapore4d = require("../../models/lottery_singapore_4d.model");

const fetchAndSaveSingapore4dLottery = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotterySingapore4d.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // ถ้ามีข้อมูลแล้ว และผลหวยออกครบแล้ว (ไม่มี "xxxx") ให้ return ข้อมูลเดิม
    if (existingLottery && existingLottery.results) {
      const hasIncompleteResults = Object.values(existingLottery.results).some(value => {
        if (typeof value === 'string') {
          return value.includes('xxxx') || value.includes('xxx') || value.includes('xx') || value === "" || value === null || value === undefined;
        }
        if (Array.isArray(value)) {
          return value.some(item => typeof item === 'string' && (item.includes('xxxx') || item.includes('xxx') || item.includes('xx')));
        }
        return value === null || value === undefined;
      });
      
      if (!hasIncompleteResults) {
        console.log(`✅ หวย Singapore 4D วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      
      console.log(`⏳ หวย Singapore 4D วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/singapore-4d/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (!data.results.first_prize) {
      throw new Error(
        `Failed to fetch and save Singapore 4D lottery: หวย Singapore 4D วันนี้ยังไม่ออกผล`
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

    const starterPrizes = data.results.starter_prizes || [];
    const consolationPrizes = data.results.consolation_prizes || [];

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title || "Singapore 4D",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      draw_number: data.draw_number,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        first_prize: data.results.first_prize,
        second_prize: data.results.second_prize,
        third_prize: data.results.third_prize,
        starter_prizes: data.results.starter_prizes,
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
          digit: [firstPrize, secondPrize, thirdPrize, ...starterPrizes, ...consolationPrizes].filter(digit => digit !== ""),
        },
        {
          code: "pack_5",
          name: "5 เด้ง",
          digit: [
            // small_4d
            firstPrize, secondPrize, thirdPrize,
            // big_4d
            firstPrize, secondPrize, thirdPrize, ...starterPrizes, ...consolationPrizes,
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

    // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้อัพเดท ถ้าไม่มีให้สร้างใหม่
    let lottery;
    if (existingLottery) {
      lottery = await LotterySingapore4d.findByIdAndUpdate(
        existingLottery._id,
        lotteryData,
        { new: true }
      );
      console.log(`🔄 อัพเดทข้อมูลหวย Singapore 4D วันนี้`);
    } else {
      lottery = new LotterySingapore4d(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวย Singapore 4D วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Singapore 4D lottery: ${error.message}`);
  }
};

const getAllSingapore4dLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotterySingapore4d.countDocuments(query);

    // Get data with pagination
    const data = await LotterySingapore4d.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllSingapore4dLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวย Singapore 4D");
  }
};

module.exports = {
  fetchAndSaveSingapore4dLottery,
  getAllSingapore4dLottery,
};
