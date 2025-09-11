const lotteryHanoiExtraService = require("../../service/lottery/lottery_hanoi_extra.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiExtraLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiExtraService.fetchAndSaveHanoiExtraLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย EXTRA ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiExtraLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiExtraLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiExtraService.getAllHanoiExtraLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย EXTRA สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiExtraLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiExtraLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiExtraService.getHanoiExtraLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย EXTRA", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย EXTRA สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiExtraLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiExtraLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiExtraService.createHanoiExtraLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอย EXTRA สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiExtraLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiExtraLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiExtraService.updateHanoiExtraLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย EXTRA", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอย EXTRA สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiExtraLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiExtraLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiExtraService.deleteHanoiExtraLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย EXTRA", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอย EXTRA สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiExtraLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย EXTRA", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiExtraLottery,
  getAllHanoiExtraLottery,
  getHanoiExtraLotteryById,
  createHanoiExtraLottery,
  updateHanoiExtraLottery,
  deleteHanoiExtraLottery,
};
