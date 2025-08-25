const lotteryThaiGsbService = require('../../service/lottery/lottery_thai_gsb.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestThaiGsbLottery = async (req, res) => {
  try {
    const lottery = await lotteryThaiGsbService.fetchAndSaveThaiGsbLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllThaiGsbLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryThaiGsbService.getAllThaiGsbLottery({
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
        console.error('Error in getAllThaiGsbLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวย ธกส'
        });
    }
};

module.exports = {
  fetchLatestThaiGsbLottery,
  getAllThaiGsbLottery
};
