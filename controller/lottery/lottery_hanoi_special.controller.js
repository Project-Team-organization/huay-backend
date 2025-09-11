const lotteryHanoiSpecialService = require("../../service/lottery/lottery_hanoi_special.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiSpecialLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiSpecialService.fetchAndSaveHanoiSpecialLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยเฉพาะกิจล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiSpecialLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiSpecialLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiSpecialService.getAllHanoiSpecialLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยเฉพาะกิจสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiSpecialLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiSpecialLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiSpecialService.getHanoiSpecialLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยเฉพาะกิจ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยเฉพาะกิจสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiSpecialLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiSpecialLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiSpecialService.createHanoiSpecialLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยเฉพาะกิจสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiSpecialLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiSpecialLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiSpecialService.updateHanoiSpecialLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยเฉพาะกิจ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยเฉพาะกิจสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiSpecialLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiSpecialLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiSpecialService.deleteHanoiSpecialLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยเฉพาะกิจ", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยเฉพาะกิจสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiSpecialLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยเฉพาะกิจ", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiSpecialLottery,
  getAllHanoiSpecialLottery,
  getHanoiSpecialLotteryById,
  createHanoiSpecialLottery,
  updateHanoiSpecialLottery,
  deleteHanoiSpecialLottery,
};
