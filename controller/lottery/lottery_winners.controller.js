const lotteryWinnersService = require('../../service/lottery/lottery_winners.service');

exports.getAllWinners = async (req, res) => {
  try {
    const result = await lotteryWinnersService.getAllWinners(req.query);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผู้ชนะรางวัลสำเร็จ",
      data: result?.data,
      pagination: result?.pagination
    });
  } catch (error) {
    console.error('Error in getAllWinners controller:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 