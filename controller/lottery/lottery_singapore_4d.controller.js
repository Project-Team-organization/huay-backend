const lotterySingapore4dService = require('../../service/lottery/lottery_singapore_4d.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

const fetchLatestSingapore4dLottery = async (req, res) => {
  try {
    const lottery = await lotterySingapore4dService.fetchAndSaveSingapore4dLottery();
    const response = await handleSuccess(lottery);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

const getAllSingapore4dLottery = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const result = await lotterySingapore4dService.getAllSingapore4dLottery({
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
        console.error('Error in getAllSingapore4dLottery:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลหวย Singapore 4D'
        });
    }
};

module.exports = {
  fetchLatestSingapore4dLottery,
  getAllSingapore4dLottery
};
