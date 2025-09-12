const axios = require("axios");
const LotteryLaoStars = require("../../models/lotterylao.stars.model");

const fetchAndSaveLaoStarsLottery = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date().toISOString().split("T")[0];
    const existingLottery = await LotteryLaoStars.findOne({
      lotto_date: today,
    });

    // ถ้ามีข้อมูลแล้ว และผลหวยออกครบแล้ว (ไม่มี "xxx") ให้ return ข้อมูลเดิม
    if (existingLottery && existingLottery.results) {
      const hasIncompleteResults = Object.values(existingLottery.results).some(value => {
        if (typeof value === 'string') {
          return value.includes('xxx') || value.includes('xx') || value === "" || value === null || value === undefined;
        }
        return value === null || value === undefined;
      });
      
      if (!hasIncompleteResults) {
        console.log(`✅ หวยลาวสตาร์วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      
      console.log(`⏳ หวยลาวสตาร์วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-stars/latest"
    );

    const { data } = response?.data;
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

    // ➤ หา 2 ตัวบน (2 หลักท้ายของ digit4)
    let twoTop = "";
    if (data.results.digit2_top) {
      twoTop = data.results.digit2_top;
    }

    // ➤ หา 2 ตัวล่าง (2 หลักหน้า ของ digit4)
    let twoBottom = "";
    if (data.results.digit2_bottom) {
      twoBottom = data.results.digit2_bottom;
    }
    // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
    let oneTop = "";
    if (data.results.digit3 && data.results.digit3.length === 3) {
      oneTop = data.results.digit3.split("").join(","); // เช่น "234" → "2,3,4"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
      oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "25" → "2,5"
    }

    const lotteryData = {
      name: data.name,
      url: "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-stars/latest",
      lottery_name: data.lotteryName,
      lotto_date: data.lotto_date,
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
    };

    // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้อัพเดท ถ้าไม่มีให้สร้างใหม่
    let lottery;
    if (existingLottery) {
      lottery = await LotteryLaoStars.findByIdAndUpdate(
        existingLottery._id,
        lotteryData,
        { new: true }
      );
      console.log(`🔄 อัพเดทข้อมูลหวยลาวสตาร์วันนี้`);
    } else {
      lottery = new LotteryLaoStars(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวยลาวสตาร์วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(
      `Failed to fetch and save Lao Stars lottery: ${error.message}`
    );
  }
};

const getAllLaoStarsLottery = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
}) => {
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
    const total = await LotteryLaoStars.countDocuments(query);

    // Get data with pagination
    const data = await LotteryLaoStars.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllLaoStarsLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาวสตาร์");
  }
};

module.exports = {
  fetchAndSaveLaoStarsLottery,
  getAllLaoStarsLottery,
};
