const lotteryWinnersService = require('../../service/lottery/lottery_winners.service');

exports.getAllWinners = async (req, res) => {
  try {
    const result = await lotteryWinnersService.getAllWinners(req.query);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ชนะรางวัลสำเร็จ",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in getAllWinners controller:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getWinnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryWinnersService.getLotteryWinnerById(id);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ชนะรางวัลสำเร็จ",
      data: result
    });
  } catch (error) {
    console.error('Error in getWinnerById controller:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLotteryWinners = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const result = await lotteryWinnersService.getLotteryWinners(
      lottery_result_id,
      parseInt(page),
      parseInt(limit),
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ชนะรางวัลสำเร็จ",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in getLotteryWinners controller:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 