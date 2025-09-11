const axios = require("axios");
const LotteryHanoiHd = require("../../models/lottery_hanoi_hd.model");

const fetchAndSaveHanoiHdLottery = async () => {
  try {
    // เช็คถ้าวันนี้อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryHanoiHd.findOne({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get(
      "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/hanoi-hd/latest"
    );
    const { data } = response.data;
    
    // ถ้า results ยังไม่ออก
    if (!data.results.prize_1st || data.results.prize_1st === "xxxx") {
      throw new Error(
        `Failed to fetch and save Hanoi HD lottery: หวยฮานอย HD วันนี้ยังไม่ออกผล`
      );
    }

    // Pre-calculate values for performance
    const prize1st = data.results.prize_1st || "";
    const prize2nd = data.results.prize_2nd || "";
    const prize3rd1 = data.results.prize_3rd_1 || "";
    const prize3rd2 = data.results.prize_3rd_2 || "";
    const digit3Top = data.results.digit3_top || "";
    const digit2Top = data.results.digit2_top || "";
    const digit2Bottom = data.results.digit2_bottom || "";

    // Extract 3 digits from prize_1st
    const prize1st3d = prize1st.slice(-3);
    const prize2nd3d = prize2nd.slice(-3);
    const prize3rd13d = prize3rd1.slice(-3);
    const prize3rd23d = prize3rd2.slice(-3);

    // Extract 2 digits from prize_1st
    const prize1st2d = prize1st.slice(-2);
    const prize2nd2d = prize2nd.slice(-2);
    const prize3rd12d = prize3rd1.slice(-2);
    const prize3rd22d = prize3rd2.slice(-2);

    // Collect all 4th prizes
    const prize4th = [
      data.results.prize_4th_1,
      data.results.prize_4th_2,
      data.results.prize_4th_3,
      data.results.prize_4th_4,
      data.results.prize_4th_5,
      data.results.prize_4th_6,
    ].filter(prize => prize && prize !== "");

    // Collect all 5th prizes
    const prize5th = [
      data.results.prize_5th_1,
      data.results.prize_5th_2,
      data.results.prize_5th_3,
      data.results.prize_5th_4,
    ].filter(prize => prize && prize !== "");

    // Collect all 6th prizes
    const prize6th = [
      data.results.prize_6th_1,
      data.results.prize_6th_2,
      data.results.prize_6th_3,
      data.results.prize_6th_4,
      data.results.prize_6th_5,
      data.results.prize_6th_6,
    ].filter(prize => prize && prize !== "");

    // Collect all 7th prizes
    const prize7th = [
      data.results.prize_7th_1,
      data.results.prize_7th_2,
      data.results.prize_7th_3,
    ].filter(prize => prize && prize !== "");

    // Collect all 2 digits prizes
    const prize2digits = [
      data.results.prize_2digits_1,
      data.results.prize_2digits_2,
      data.results.prize_2digits_3,
      data.results.prize_2digits_4,
    ].filter(prize => prize && prize !== "");

    const lotteryData = {
      name: data.name,
      url: data.url,
      title: data.title || "ฮานอย HD",
      lotto_date: data.lotto_date,
      lottery_name: data.lotteryName,
      draw_number: data.draw_number,
      start_spin: new Date(data.start_spin),
      show_result: new Date(data.show_1st),
      results: {
        digit3_top: data.results.digit3_top,
        digit2_top: data.results.digit2_top,
        digit2_bottom: data.results.digit2_bottom,
        prize_1st: data.results.prize_1st,
        prize_2nd: data.results.prize_2nd,
        prize_3rd_1: data.results.prize_3rd_1,
        prize_3rd_2: data.results.prize_3rd_2,
        prize_4th_1: data.results.prize_4th_1,
        prize_4th_2: data.results.prize_4th_2,
        prize_4th_3: data.results.prize_4th_3,
        prize_4th_4: data.results.prize_4th_4,
        prize_4th_5: data.results.prize_4th_5,
        prize_4th_6: data.results.prize_4th_6,
        prize_5th_1: data.results.prize_5th_1,
        prize_5th_2: data.results.prize_5th_2,
        prize_5th_3: data.results.prize_5th_3,
        prize_5th_4: data.results.prize_5th_4,
        prize_6th_1: data.results.prize_6th_1,
        prize_6th_2: data.results.prize_6th_2,
        prize_6th_3: data.results.prize_6th_3,
        prize_6th_4: data.results.prize_6th_4,
        prize_6th_5: data.results.prize_6th_5,
        prize_6th_6: data.results.prize_6th_6,
        prize_7th_1: data.results.prize_7th_1,
        prize_7th_2: data.results.prize_7th_2,
        prize_7th_3: data.results.prize_7th_3,
        prize_2digits_1: data.results.prize_2digits_1,
        prize_2digits_2: data.results.prize_2digits_2,
        prize_2digits_3: data.results.prize_2digits_3,
        prize_2digits_4: data.results.prize_2digits_4,
      },
      betting_types: [
        {
          code: "4top",
          name: "4 ตัวบน",
          digit: prize1st ? [prize1st.slice(-4)] : [],
        },
        {
          code: "3top",
          name: "3 ตัวบน",
          digit: prize1st3d ? [prize1st3d] : [],
        },
        {
          code: "2top",
          name: "2 ตัวบน",
          digit: prize1st2d ? [prize1st2d] : [],
        },
        {
          code: "2bottom",
          name: "2 ตัวล่าง",
          digit: prize2nd ? [prize2nd.slice(-2)] : [],
        },
      ],
    };

    const lottery = new LotteryHanoiHd(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Hanoi HD lottery: ${error.message}`);
  }
};

const getAllHanoiHdLottery = async ({ page, limit, startDate, endDate }) => {
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
    const total = await LotteryHanoiHd.countDocuments(query);

    // Get data with pagination
    const data = await LotteryHanoiHd.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Error in getAllHanoiHdLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย HD");
  }
};

const getHanoiHdLotteryById = async (id) => {
  try {
    const lottery = await LotteryHanoiHd.findById(id);
    return lottery;
  } catch (error) {
    console.error("Error in getHanoiHdLotteryById service:", error);
    throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย HD");
  }
};

const createHanoiHdLottery = async (lotteryData) => {
  try {
    const lottery = new LotteryHanoiHd(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    console.error("Error in createHanoiHdLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย HD");
  }
};

const updateHanoiHdLottery = async (id, updateData) => {
  try {
    const lottery = await LotteryHanoiHd.findByIdAndUpdate(id, updateData, { new: true });
    return lottery;
  } catch (error) {
    console.error("Error in updateHanoiHdLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย HD");
  }
};

const deleteHanoiHdLottery = async (id) => {
  try {
    const lottery = await LotteryHanoiHd.findByIdAndDelete(id);
    return lottery;
  } catch (error) {
    console.error("Error in deleteHanoiHdLottery service:", error);
    throw new Error("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย HD");
  }
};

module.exports = {
  fetchAndSaveHanoiHdLottery,
  getAllHanoiHdLottery,
  getHanoiHdLotteryById,
  createHanoiHdLottery,
  updateHanoiHdLottery,
  deleteHanoiHdLottery,
};
