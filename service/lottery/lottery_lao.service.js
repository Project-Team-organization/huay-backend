const axios = require("axios");
const LotteryLao = require("../../models/lotterylao.model");

const fetchAndSaveLaoLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    // ถ้าเวลาเป็น 00:00:00 ก็ต้องหาในวันก่อนหน้า
    const existingLottery = await LotteryLao.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-lottery/latest"
    );
    const { data } = response.data;
    
    // ถ้า numbers
    if (data.numbers.tail4 == "xxxx") {
      throw new Error(
        `Failed to fetch and save Lao lottery: หวยลาววันนี้ยังไม่ออกผล`
      );
    }

    // ➤ หา 3 ตัวบน
    let threeTop = "";
    if (data.numbers.digit3) {
      threeTop = data.numbers.digit3;
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
    if (data.numbers.digit2_top) {
      threeTop = data.numbers.digit2_top;
    }

    // ➤ หา 2 ตัวล่าง (2 หลักหน้า ของ digit4)
    let twoBottom = "";
     if (data.numbers.digit2_bottom) {
      threeTop = data.numbers.digit2_bottom;
    }
    // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
    let oneTop = "";
    if (data.numbers.digit3 && data.numbers.digit3.length === 3) {
      oneTop = data.numbers.digit3.split("").join(","); // เช่น "234" → "2,3,4"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.numbers.digit2_bottom && data.numbers.digit2_bottom.length === 2) {
      oneBottom = data.numbers.digit2_bottom.split("").join(","); // เช่น "25" → "2,5"
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title,
      lotto_date: data.date,
      lottery_name: data.lotteryName,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        digit5: data.numbers.digit5,
        digit4: data.numbers.digit4,
        digit3: data.numbers.digit3,
        digit2_top: data.numbers.digit2_top,
        digit2_bottom: data.numbers.digit2_bottom,
        animal: data.numbers.animal,
        development: data.numbers.development,
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

    const lottery = new LotteryLao(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao lottery: ${error.message}`);
  }
};

const getAllLaoLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryLao.countDocuments(query);

    // Get data with pagination
    const data = await LotteryLao.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllLaoLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว");
  }
};

module.exports = {
  fetchAndSaveLaoLottery,
  getAllLaoLottery,
};
