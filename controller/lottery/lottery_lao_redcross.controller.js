const lotteryLaoRedcrossService = require('../../service/lottery/lottery_lao_redcross.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestLaoRedcrossLottery = async (req, res) => {
  try {
    const lottery = await lotteryLaoRedcrossService.fetchAndSaveLaoRedcrossLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllLaoRedcrossLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotteryLaoRedcrossService.getAllLaoRedcrossLottery({
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
        console.error('Error in getAllLaoRedcrossLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวยลาวกาชาด'
        });
    }
};

module.exports = {
  fetchLatestLaoRedcrossLottery,
  getAllLaoRedcrossLottery
};
