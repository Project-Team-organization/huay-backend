const axios = require("axios");
const LotteryThaiSavings = require("../../models/lottery_thai_savings.model");

const fetchAndSaveThaiSavingsLottery = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryThaiSavings.findOne({
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
        return value === null || value === undefined;
      });
      
      if (!hasIncompleteResults) {
        console.log(`✅ หวยไทยออมสิน วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      
      console.log(`⏳ หวยไทยออมสิน วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/thai-savings/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (!data.results.digit4_top) {
      throw new Error(
        `Failed to fetch and save Thai Savings lottery: หวยออมสินวันนี้ยังไม่ออกผล`
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
      oneTop = data.results.digit3_top.split("").join(","); // เช่น "234" → "2,3,4"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
      oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "25" → "2,5"
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        digit4_top: data.results.digit4_top,
        digit3_top: data.results.digit3_top,
        digit2_top: data.results.digit2_top,
        digit2_bottom: data.results.digit2_bottom,
        prize1_full: data.results.prize1_full,
        prize2_full: data.results.prize2_full,
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
      lottery = await LotteryThaiSavings.findByIdAndUpdate(
        existingLottery._id,
        lotteryData,
        { new: true }
      );
      console.log(`🔄 อัพเดทข้อมูลหวยไทยออมสิน วันนี้`);
    } else {
      lottery = new LotteryThaiSavings(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวยไทยออมสิน วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Thai Savings lottery: ${error.message}`);
  }
};

const getAllThaiSavingsLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryThaiSavings.countDocuments(query);

    // Get data with pagination
    const data = await LotteryThaiSavings.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllThaiSavingsLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยออมสิน");
  }
};

module.exports = {
  fetchAndSaveThaiSavingsLottery,
  getAllThaiSavingsLottery,
};
