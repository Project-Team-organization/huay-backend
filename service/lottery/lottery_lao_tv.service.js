const axios = require("axios");
const LotteryLaoTv = require("../../models/lottery_lao_tv.model");

const apiUrl = 'https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-tv/latest';

const fetchAndSaveLaoTvLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    // ถ้าเวลาเป็น 00:00:00 ก็ต้องหาในวันก่อนหน้า
    const existingLottery = await LotteryLaoTv.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      apiUrl
    );
    const { data } = response.data;
    
    // ตรวจสอบว่ามีผลออกแล้วหรือไม่
    if (!data.results || !data.results.digit5 || data.results.digit5 === "xxxx") {
      throw new Error(
        `Failed to fetch and save Lao TV lottery: หวยลาว TV วันนี้ยังไม่ออกผล`
      );
    }

    // ➤ หา 3 ตัวบน
    let threeTop = "";
    if (data.results.digit3) {
      threeTop = data.results.digit3;
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

    // ➤ หา 2 ตัวบน
    let twoTop = "";
    if (data.results.digit2_top) {
      twoTop = data.results.digit2_top;
    }

    // ➤ หา 2 ตัวล่าง
    let twoBottom = "";
    if (data.results.digit2_bottom) {
      twoBottom = data.results.digit2_bottom;
    }
    
    // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
    let oneTop = "";
    if (data.results.digit3 && data.results.digit3.length === 3) {
      oneTop = data.results.digit3.split("").join(","); // เช่น "764" → "7,6,4"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
      oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "24" → "2,4"
    }

    const lotteryData = {
      name: data.name || "lao-lottery",
      url: data.url || "https://api.lao-tv.com",
      title: data.lotteryName || "หวยลาว TV",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName || "หวยลาว TV",
      start_spin: new Date(data.start_spin),
      show_result: new Date(data.show_result),
      results: {
        digit5: data.results.digit5,
        digit4: data.results.digit4,
        digit3: data.results.digit3,
        digit2_top: data.results.digit2_top,
        digit2_bottom: data.results.digit2_bottom,
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
      scraper: data.scraper || "lao-tv",
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
    };

    const lottery = new LotteryLaoTv(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao TV lottery: ${error.message}`);
  }
};

const getAllLaoTvLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryLaoTv.countDocuments(query);

    // Get data with pagination
    const data = await LotteryLaoTv.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllLaoTvLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว TV");
  }
};

module.exports = {
  fetchAndSaveLaoTvLottery,
  getAllLaoTvLottery,
};
