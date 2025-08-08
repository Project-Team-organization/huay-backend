const lotteryLaoExtraService = require('../../service/lottery/lottery_lao_extra.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestLaoExtraLottery = async (req, res) => {
  try {
    const lottery = await lotteryLaoExtraService.fetchAndSaveLaoExtraLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllLaoExtraLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryLaoExtraService.getAllLaoExtraLottery({
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
        console.error('Error in getAllLaoExtraLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว Extra'
        });
    }
};

module.exports = {
  fetchLatestLaoExtraLottery,
  getAllLaoExtraLottery
}; 