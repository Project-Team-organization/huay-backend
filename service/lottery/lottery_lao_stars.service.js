const axios = require("axios");
const LotteryLaoStars = require("../../models/lotterylao.stars.model");

const fetchAndSaveLaoStarsLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date().toISOString().split("T")[0];
    const existingLottery = await LotteryLaoStars.findOne({
      lotto_date: today,
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-stars/latest"
    );
    console.log("Fetched Lao Stars lottery data:", response.data);

    const { data } = response?.data;

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
    };

    const lottery = new LotteryLaoStars(lotteryData);
    await lottery.save();
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
