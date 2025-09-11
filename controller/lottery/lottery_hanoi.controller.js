const lotteryHanoiService = require("../../service/lottery/lottery_hanoi.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiService.fetchAndSaveHanoiLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiService.getAllHanoiLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiService.getHanoiLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiService.createHanoiLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiService.updateHanoiLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiService.deleteHanoiLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiLottery,
  getAllHanoiLottery,
  getHanoiLotteryById,
  createHanoiLottery,
  updateHanoiLottery,
  deleteHanoiLottery,
};
