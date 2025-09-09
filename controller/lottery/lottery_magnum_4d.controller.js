const lotteryMagnum4dService = require('../../service/lottery/lottery_magnum_4d.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestMagnum4dLottery = async (req, res) => {
  console.log('fetchLatestMagnum4dLottery');
  try {
    const lottery = await lotteryMagnum4dService.fetchAndSaveMagnum4dLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllMagnum4dLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryMagnum4dService.getAllMagnum4dLottery({
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
        console.error('Error in getAllMagnum4dLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวย Magnum 4D'
        });
    }
};

module.exports = {
  fetchLatestMagnum4dLottery,
  getAllMagnum4dLottery
};
