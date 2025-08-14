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

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title,
      lotto_date: data.date,
      lottery_name: data.lotteryName,
      start_spin: new Date(),
      show_result: new Date(),
      results: {
        tail4: data.numbers.tail4,
        tail3: data.numbers.tail3,
        tail2: data.numbers.tail2,
        animal: data.numbers.animal,
        development: data.numbers.development,
      },
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
