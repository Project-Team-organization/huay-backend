const lotteryLaoHdService = require('../../service/lottery/lottery_lao_hd.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestLaoHdLottery = async (req, res) => {
  try {
    const lottery = await lotteryLaoHdService.fetchAndSaveLaoHdLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllLaoHdLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryLaoHdService.getAllLaoHdLottery({
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
        console.error('Error in getAllLaoHdLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาว HD'
        });
    }
};

module.exports = {
  fetchLatestLaoHdLottery,
  getAllLaoHdLottery
};
