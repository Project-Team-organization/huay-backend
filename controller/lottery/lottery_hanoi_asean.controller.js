const lotteryHanoiAseanService = require("../../service/lottery/lottery_hanoi_asean.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiAseanLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiAseanService.fetchAndSaveHanoiAseanLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยอาเซียนล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiAseanLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiAseanLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiAseanService.getAllHanoiAseanLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยอาเซียนสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiAseanLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiAseanLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiAseanService.getHanoiAseanLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยอาเซียน", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยอาเซียนสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiAseanLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiAseanLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiAseanService.createHanoiAseanLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยอาเซียนสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiAseanLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiAseanLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiAseanService.updateHanoiAseanLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยอาเซียน", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยอาเซียนสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiAseanLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiAseanLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiAseanService.deleteHanoiAseanLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยอาเซียน", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยอาเซียนสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiAseanLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยอาเซียน", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiAseanLottery,
  getAllHanoiAseanLottery,
  getHanoiAseanLotteryById,
  createHanoiAseanLottery,
  updateHanoiAseanLottery,
  deleteHanoiAseanLottery,
};
