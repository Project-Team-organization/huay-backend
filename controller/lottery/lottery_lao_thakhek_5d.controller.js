const lotteryLaoThakhek5dService = require('../../service/lottery/lottery_lao_thakhek_5d.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestLaoThakhek5dLottery = async (req, res) => {
  try {
    const lottery = await lotteryLaoThakhek5dService.fetchAndSaveLaoThakhek5dLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllLaoThakhek5dLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryLaoThakhek5dService.getAllLaoThakhek5dLottery({
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
        console.error('Error in getAllLaoThakhek5dLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาวท่าแขก 5D'
        });
    }
};

module.exports = {
  fetchLatestLaoThakhek5dLottery,
  getAllLaoThakhek5dLottery
};
