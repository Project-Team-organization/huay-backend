const axios = require("axios");
const LotteryLaoStarsVip = require("../../models/lottery_lao_stars_vip.model");

const apiUrl = 'https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-stars-vip/latest';

// Mutex เพื่อป้องกันการเรียกใช้พร้อมกัน
const processingLock = new Map();

const fetchAndSaveLaoStarsVipLottery = async () => {
  const today = new Date().toISOString().split("T")[0];
  const lockKey = `lao-stars-vip-${today}`;
  
  // ตรวจสอบว่ากำลังประมวลผลอยู่หรือไม่
  if (processingLock.has(lockKey)) {
    console.log(`⏳ หวยลาวสตาร์ VIP วันนี้กำลังประมวลผลอยู่...`);
    return processingLock.get(lockKey);
  }
  
  const processPromise = processLotteryData();
  processingLock.set(lockKey, processPromise);
  
  try {
    const result = await processPromise;
    return result;
  } finally {
    processingLock.delete(lockKey);
  }
};

const processLotteryData = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date().toISOString().split("T")[0];
    const existingLottery = await LotteryLaoStarsVip.findOne({
      lotto_date: today,
      results: { $exists: true, $ne: null }
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
        console.log(`✅ หวยลาวสตาร์ VIP วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      
      console.log(`⏳ หวยลาวสตาร์ VIP วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      apiUrl
    );
    const { data } = response.data;
    
    // ตรวจสอบว่ามีผลออกแล้วหรือไม่
    if (!data.results || !data.results.digit5 || data.results.digit5 === "xxxx") {
      throw new Error(
        `Failed to fetch and save Lao Stars VIP lottery: หวยลาวสตาร์ VIP วันนี้ยังไม่ออกผล`
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
      url: data.url || "https://api.laostars-vip.com",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName || "หวยลาวสตาร์ VIP",
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
      scraper: data.scraper || "lao-stars-vip",
      scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
      apiUpdate: data.apiUpdate ? new Date(data.apiUpdate) : null,
      apiNow: data.apiNow || "",
    };

    // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้อัพเดท ถ้าไม่มีให้สร้างใหม่
    let lottery;
    if (existingLottery) {
      lottery = await LotteryLaoStarsVip.findByIdAndUpdate(
        existingLottery._id,
        lotteryData,
        { new: true }
      );
      console.log(`🔄 อัพเดทข้อมูลหวยลาวสตาร์ VIP วันนี้`);
    } else {
      lottery = new LotteryLaoStarsVip(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวยลาวสตาร์ VIP วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao Stars VIP lottery: ${error.message}`);
  }
};

const getAllLaoStarsVipLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryLaoStarsVip.countDocuments(query);

    // Get data with pagination
    const data = await LotteryLaoStarsVip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllLaoStarsVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาวสตาร์ VIP");
  }
};

module.exports = {
  fetchAndSaveLaoStarsVipLottery,
  getAllLaoStarsVipLottery,
};
