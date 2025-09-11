const lotteryHanoiTvService = require("../../service/lottery/lottery_hanoi_tv.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiTvLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiTvService.fetchAndSaveHanoiTvLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย TV ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiTvLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiTvLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiTvService.getAllHanoiTvLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย TV สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiTvLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiTvLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiTvService.getHanoiTvLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย TV", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย TV สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiTvLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiTvLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiTvService.createHanoiTvLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอย TV สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiTvLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiTvLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiTvService.updateHanoiTvLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย TV", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอย TV สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiTvLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiTvLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiTvService.deleteHanoiTvLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย TV", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอย TV สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiTvLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย TV", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiTvLottery,
  getAllHanoiTvLottery,
  getHanoiTvLotteryById,
  createHanoiTvLottery,
  updateHanoiTvLottery,
  deleteHanoiTvLottery,
};
