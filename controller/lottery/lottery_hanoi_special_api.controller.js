const lotteryHanoiSpecialApiService = require("../../service/lottery/lottery_hanoi_special_api.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiSpecialApiLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiSpecialApiService.fetchAndSaveHanoiSpecialApiLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพิเศษล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiSpecialApiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiSpecialApiLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiSpecialApiService.getAllHanoiSpecialApiLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพิเศษสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiSpecialApiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiSpecialApiLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiSpecialApiService.getHanoiSpecialApiLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพิเศษ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพิเศษสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiSpecialApiLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiSpecialApiLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiSpecialApiService.createHanoiSpecialApiLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยพิเศษสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiSpecialApiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiSpecialApiLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiSpecialApiService.updateHanoiSpecialApiLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพิเศษ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยพิเศษสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiSpecialApiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiSpecialApiLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiSpecialApiService.deleteHanoiSpecialApiLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพิเศษ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยพิเศษสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiSpecialApiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยพิเศษ", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiSpecialApiLottery,
  getAllHanoiSpecialApiLottery,
  getHanoiSpecialApiLotteryById,
  createHanoiSpecialApiLottery,
  updateHanoiSpecialApiLottery,
  deleteHanoiSpecialApiLottery,
};
