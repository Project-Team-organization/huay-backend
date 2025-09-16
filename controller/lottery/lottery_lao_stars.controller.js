const lotteryLaoStarsService = require('../../service/lottery/lottery_lao_stars.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

// Rate limiting สำหรับป้องกันการเรียกใช้ซ้ำ
const rateLimit = require('express-rate-limit');

const lotteryRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 นาที
  max: 1, // เรียกได้แค่ 1 ครั้งต่อ 5 นาที
  message: {
    error: 'หวยลาวสตาร์สามารถอัพเดทได้แค่ 1 ครั้งต่อ 5 นาที',
    message: 'กรุณารอสักครู่ก่อนเรียกใช้ใหม่'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const fetchLatestLaoStarsLottery = async (req, res) => {
  try {
    const lottery = await lotteryLaoStarsService.fetchAndSaveLaoStarsLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllLaoStarsLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryLaoStarsService.getAllLaoStarsLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });

    const response = await handleSuccess(result.data, 'Success', 200, {
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

module.exports = {
  fetchLatestLaoStarsLottery,
  getAllLaoStarsLottery,
  lotteryRateLimit
}; 