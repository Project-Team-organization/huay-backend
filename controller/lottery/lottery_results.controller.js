const lotteryResultService = require('../../service/lottery/lottery_results.service');

// ประกาศผลหวยและค้นหาผู้ชนะ
exports.evaluateLotteryResults = async (req, res) => {
  try {
    const { lottery_set_id, results } = req.body;
    
    const result = await lotteryResultService.evaluateLotteryResults(
      lottery_set_id,
      results,
      req.user._id // ต้องมาจาก middleware auth
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ดึงรายการผู้ชนะทั้งหมด
exports.getLotteryWinners = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    
    const winners = await lotteryResultService.getLotteryWinners(lottery_result_id);

    res.status(200).json({
      success: true,
      data: winners
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    
    const resultItems = await lotteryResultService.getLotteryResultItems(lottery_result_id);

    res.status(200).json({
      success: true,
      data: resultItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 