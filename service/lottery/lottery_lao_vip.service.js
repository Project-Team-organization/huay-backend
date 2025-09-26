const axios = require("axios");
const LotteryLaoVip = require("../../models/lottery_lao_vip.model");

const apiUrl = 'https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-vip/latest';

const fetchAndSaveLaoVipLottery = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date();
    // ถ้าเวลาเป็น 00:00:00 ก็ต้องหาในวันก่อนหน้า
    const existingLottery = await LotteryLaoVip.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
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
        console.log(`✅ หวยลาว VIP วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      
      console.log(`⏳ หวยลาว VIP วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      apiUrl
    );
    const { data } = response.data;
    
    // ตรวจสอบว่ามีผลออกแล้วหรือไม่
    if (!data.results || !data.results.digit5 || data.results.digit5 === "xxx") {
      throw new Error(
        `Failed to fetch and save Lao VIP lottery: หวยลาว VIP วันนี้ยังไม่ออกผล`
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
      oneTop = data.results.digit3.split("").join(","); // เช่น "234" → "2,3,4"
    }

    // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
    let oneBottom = "";
    if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
      oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "25" → "2,5"
    }

    const lotteryData = {
      name: data.name || "lao-lottery",
      url: data.url || "https://laosviplot.com",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName || "หวยลาว VIP",
      start_spin: data.start_spin ? new Date(data.start_spin) : null,
      show_result: data.show_result ? new Date(data.show_result) : null,
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
      scraper: data.scraper || "lao-vip",
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
    };

    // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้อัพเดท ถ้าไม่มีให้สร้างใหม่
    let lottery;
    if (existingLottery) {
      lottery = await LotteryLaoVip.findByIdAndUpdate(
        existingLottery._id,
        lotteryData,
        { new: true }
      );
      console.log(`🔄 อัพเดทข้อมูลหวยลาว VIP วันนี้`);
    } else {
      lottery = new LotteryLaoVip(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวยลาว VIP วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao VIP lottery: ${error.message}`);
  }
};

const getAllLaoVipLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryLaoVip.countDocuments(query);

    // Get data with pagination
    const data = await LotteryLaoVip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllLaoVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว VIP");
  }
};

module.exports = {
  fetchAndSaveLaoVipLottery,
  getAllLaoVipLottery,
};
