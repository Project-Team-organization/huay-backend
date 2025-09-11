const lotteryHanoiHdService = require("../../service/lottery/lottery_hanoi_hd.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiHdLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiHdService.fetchAndSaveHanoiHdLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย HD ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiHdLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiHdLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiHdService.getAllHanoiHdLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย HD สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiHdLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiHdLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiHdService.getHanoiHdLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย HD", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย HD สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiHdLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiHdLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiHdService.createHanoiHdLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอย HD สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiHdLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiHdLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiHdService.updateHanoiHdLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย HD", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอย HD สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiHdLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiHdLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiHdService.deleteHanoiHdLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย HD", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอย HD สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiHdLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย HD", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiHdLottery,
  getAllHanoiHdLottery,
  getHanoiHdLotteryById,
  createHanoiHdLottery,
  updateHanoiHdLottery,
  deleteHanoiHdLottery,
};
