const axios = require("axios");
const LotteryKoreanStockVip = require("../../models/lottery_korean_stock_vip.model");

const fetchAndSaveKoreanStockVipLottery = async () => {
  try {
    // เช็คถ้าวันนี้มีข้อมูลแล้ว และผลหวยออกครบแล้ว ไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryKoreanStockVip.findOne({
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
        console.log(`✅ หวยหุ้นเกาหลี VIP วันนี้มีข้อมูลครบแล้ว ไม่ต้องอัพเดท`);
        return existingLottery;
      }
      console.log(`⏳ หวยหุ้นเกาหลี VIP วันนี้มีข้อมูลแต่ยังไม่ออกครบ จะอัพเดทใหม่`);
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/korean-stock-vip/latest"
    );
    const { data } = response.data;
    
    // Extract values from Korean Stock VIP lottery response
    const digit3Top = data.results.digit3_top || "";
    const digit2Top = data.results.digit2_top || "";
    const digit2Bottom = data.results.digit2_bottom || "";

    // Extract 3 digits from digit3_top
    const digit3Top3d = digit3Top.slice(-3);
    const digit3Top2d = digit3Top.slice(-2);

    const lotteryData = {
      name: data.name,
      url: data.url,
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      draw_number: data.draw_time || "",
      start_spin: new Date(),
      show_result: new Date(data.scrapedAt),
      results: {
        digit3_top: data.results.digit3_top,
        digit2_top: data.results.digit2_top,
        digit2_bottom: data.results.digit2_bottom,
      },
      betting_types: [
        {
          code: "3top",
          name: "3 ตัวบน",
          digit: digit3Top3d ? [digit3Top3d] : [],
        },
        {
          code: "2top",
          name: "2 ตัวบน",
          digit: digit2Top ? [digit2Top] : [],
        },
        {
          code: "2bottom",
          name: "2 ตัวล่าง",
          digit: digit2Bottom ? [digit2Bottom] : [],
        },
      ],
    };

    let lottery;
    if (existingLottery) {
      lottery = await LotteryKoreanStockVip.findByIdAndUpdate(existingLottery._id, lotteryData, { new: true });
      console.log(`🔄 อัพเดทข้อมูลหวยหุ้นเกาหลี VIP วันนี้`);
    } else {
      lottery = new LotteryKoreanStockVip(lotteryData);
      await lottery.save();
      console.log(`💾 บันทึกข้อมูลหวยหุ้นเกาหลี VIP วันนี้ใหม่`);
    }
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Korean Stock VIP lottery: ${error.message}`);
  }
};

const getAllKoreanStockVipLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryKoreanStockVip.countDocuments(query);

    // Get data with pagination
    const data = await LotteryKoreanStockVip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllKoreanStockVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นเกาหลี VIP");
  }
};

const getKoreanStockVipLotteryById = async (id) => {
  try {
    const lottery = await LotteryKoreanStockVip.findById(id);
    return lottery;
  } catch (error) {
    console.error("Error in getKoreanStockVipLotteryById service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นเกาหลี VIP");
  }
};

const createKoreanStockVipLottery = async (lotteryData) => {
  try {
    const lottery = new LotteryKoreanStockVip(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    console.error("Error in createKoreanStockVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยหุ้นเกาหลี VIP");
  }
};

const updateKoreanStockVipLottery = async (id, updateData) => {
  try {
    const lottery = await LotteryKoreanStockVip.findByIdAndUpdate(id, updateData, { new: true });
    return lottery;
  } catch (error) {
    console.error("Error in updateKoreanStockVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยหุ้นเกาหลี VIP");
  }
};

const deleteKoreanStockVipLottery = async (id) => {
  try {
    const lottery = await LotteryKoreanStockVip.findByIdAndDelete(id);
    return lottery;
  } catch (error) {
    console.error("Error in deleteKoreanStockVipLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการลบข้อมูลหวยหุ้นเกาหลี VIP");
  }
};

module.exports = {
  fetchAndSaveKoreanStockVipLottery,
  getAllKoreanStockVipLottery,
  getKoreanStockVipLotteryById,
  createKoreanStockVipLottery,
  updateKoreanStockVipLottery,
  deleteKoreanStockVipLottery,
};
