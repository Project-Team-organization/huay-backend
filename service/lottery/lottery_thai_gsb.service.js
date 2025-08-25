const axios = require("axios");
const LotteryThaiGsb = require("../../models/lottery_thai_gsb.model");

const fetchAndSaveThaiGsbLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryThaiGsb.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/thai-gsb/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (data.results.digit7 == "xxxxxxx") {
      throw new Error(
        `Failed to fetch and save Thai GSB lottery: หวยธกสวันนี้ยังไม่ออกผล`
      );
    }

    // ➤ หา 3 ตัวบน
    let threeTop = "";
    if (data.results.digit3_top) {
      threeTop = data.results.digit3_top;
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
    
    // ➤ 1 ตัวบน (วิ่งบน จาก digit3_top)
    let oneTop = "";
    if (data.results.digit3_top && data.results.digit3_top.length === 3) {
      oneTop = data.results.digit3_top.split("").join(","); // เช่น "101" → "1,0,1"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
      oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "38" → "3,8"
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title || "หวย ธ.ก.ส.",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        digit7: data.results.digit7,
        digit6: data.results.digit6,
        digit5: data.results.digit5,
        digit4: data.results.digit4,
        digit3_top: data.results.digit3_top,
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

    const lottery = new LotteryThaiGsb(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Thai GSB lottery: ${error.message}`);
  }
};

const getAllThaiGsbLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryThaiGsb.countDocuments(query);

    // Get data with pagination
    const data = await LotteryThaiGsb.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllThaiGsbLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวย ธกส");
  }
};

module.exports = {
  fetchAndSaveThaiGsbLottery,
  getAllThaiGsbLottery,
};
