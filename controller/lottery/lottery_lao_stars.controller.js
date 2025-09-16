const lotteryLaoStarsService = require('../../service/lottery/lottery_lao_stars.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

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
  getAllLaoStarsLottery
}; 