const lotteryResultService = require('../../service/lottery/lottery_results.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

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

// 1. ดึงข้อมูลทั้งหมดแบบ pagination
exports.getAllLotteryResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, username, startDate, endDate } = req.query;

    const result = await lotteryResultService.getAllLotteryResults({
      page: parseInt(page),
      limit: parseInt(limit),
      username,
      startDate,
      endDate
    });

    const response = await handleSuccess(
      result.data,
      'ดึงข้อมูลผลรางวัลทั้งหมดสำเร็จ',
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, 'ไม่สามารถดึงข้อมูลผลรางวัลได้');
    return res.status(response.status).json(response);
  }
};

// 2. ดึงข้อมูลตาม id แบบ pagination
exports.getLotteryResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await lotteryResultService.getLotteryResultById(id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const response = await handleSuccess(
      result.data,
      'ดึงข้อมูลผลรางวัลสำเร็จ',
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, 'ไม่สามารถดึงข้อมูลผลรางวัลได้');
    return res.status(response.status).json(response);
  }
};

// 3. ดึงข้อมูลตาม lottery_result_id แบบ pagination
exports.getLotteryResultsByResultId = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await lotteryResultService.getLotteryResultsByResultId(
      lottery_result_id,
      {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    );

    const response = await handleSuccess(
      result.data,
      'ดึงข้อมูลผลรางวัลสำเร็จ',
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, 'ไม่สามารถดึงข้อมูลผลรางวัลได้');
    return res.status(response.status).json(response);
  }
};

// 4. ดึงข้อมูลตาม betting_type_id แบบ pagination
exports.getLotteryResultsByBettingType = async (req, res) => {
  try {
    const { betting_type_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await lotteryResultService.getLotteryResultsByBettingType(
      betting_type_id,
      {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    );

    const response = await handleSuccess(
      result.data,
      'ดึงข้อมูลผลรางวัลสำเร็จ',
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, 'ไม่สามารถดึงข้อมูลผลรางวัลได้');
    return res.status(response.status).json(response);
  }
};

// 5. ลบข้อมูลตาม lottery_result_id
exports.deleteLotteryResultAndItems = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    
    await lotteryResultService.deleteLotteryResultAndItems(lottery_result_id);

    const response = await handleSuccess(
      null,
      'ลบข้อมูลผลรางวัลสำเร็จ',
      200
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, 'ไม่สามารถลบข้อมูลผลรางวัลได้');
    return res.status(response.status).json(response);
  }
}; 