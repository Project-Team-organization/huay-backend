const lotteryHanoiStarService = require("../../service/lottery/lottery_hanoi_star.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiStarLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiStarService.fetchAndSaveHanoiStarLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยสตาร์ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiStarLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiStarLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiStarService.getAllHanoiStarLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยสตาร์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiStarLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiStarLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiStarService.getHanoiStarLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยสตาร์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยสตาร์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiStarLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiStarLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiStarService.createHanoiStarLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยสตาร์สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiStarLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiStarLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiStarService.updateHanoiStarLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยสตาร์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยสตาร์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiStarLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiStarLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiStarService.deleteHanoiStarLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยสตาร์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยสตาร์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiStarLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยสตาร์", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiStarLottery,
  getAllHanoiStarLottery,
  getHanoiStarLotteryById,
  createHanoiStarLottery,
  updateHanoiStarLottery,
  deleteHanoiStarLottery,
};
