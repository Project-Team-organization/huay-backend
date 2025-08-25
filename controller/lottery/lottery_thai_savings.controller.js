const lotteryThaiSavingsService = require('../../service/lottery/lottery_thai_savings.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestThaiSavingsLottery = async (req, res) => {
  try {
    const lottery = await lotteryThaiSavingsService.fetchAndSaveThaiSavingsLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllThaiSavingsLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryThaiSavingsService.getAllThaiSavingsLottery({
            page: parseInt(page),
            limit: parseInt(limit),
            startDate,
            endDate
        });

        res.status(200).json({
            status: 'success',
            data: result.data,
            pagination: {
                total: result.total,
                page: parseInt(page),
                totalPages: Math.ceil(result.total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error in getAllThaiSavingsLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวยออมสิน'
        });
    }
};

module.exports = {
  fetchLatestThaiSavingsLottery,
  getAllThaiSavingsLottery
};
