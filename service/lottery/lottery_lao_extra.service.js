const axios = require('axios');
const LotteryLaoExtra = require('../../models/lotterylao.extra.model');

const fetchAndSaveLaoExtraLottery = async () => {
  try {
    //เช็คถ้าวันนี้ อัพเดทแล้วไม่ต้องอัพอีก
    const today = new Date();
    const existingLottery = await LotteryLaoExtra.findOne({ createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) , $lt: new Date(today.setHours(23, 59, 59, 999)) } });
    
    if (existingLottery) {
      return existingLottery;
    }

    const response = await axios.get('https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-extra/latest');
    const { data } = response.data;

    if(data.results.digit5 == 'xxxxx'){
      throw new Error(`Failed to fetch and save Lao Extra lottery: หวยลาว Extra วันนี้ยังไม่ออกผล`);
    }

    const lotteryData = {
      name: data.name,
      url: data.url,
      lotto_date: data.lotto_date,
      start_spin: new Date(data.start_spin),
      show_result: new Date(data.show_result),
      results: {
        digit5: data.results.digit5,
        digit4: data.results.digit4,
        digit3: data.results.digit3,
        digit2_top: data.results.digit2_top,
        digit2_bottom: data.results.digit2_bottom
      }
    };

    const lottery = new LotteryLaoExtra(lotteryData);
    await lottery.save();
    return lottery;
  } catch (error) {
    throw new Error(`Failed to fetch and save Lao Extra lottery: ${error.message}`);
  }
};

const getAllLaoExtraLottery = async ({ page, limit, startDate, endDate }) => {
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
        const total = await LotteryLaoExtra.countDocuments(query);

        // Get data with pagination
        const data = await LotteryLaoExtra.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            data,
            total
        };
    } catch (error) {
        console.error('Error in getAllLaoExtraLottery service:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว Extra');
    }
};

module.exports = {
  fetchAndSaveLaoExtraLottery,
  getAllLaoExtraLottery
}; 