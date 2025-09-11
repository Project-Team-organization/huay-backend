const lotteryHanoiVipService = require("../../service/lottery/lottery_hanoi_vip.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiVipLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiVipService.fetchAndSaveHanoiVipLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย VIP ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiVipLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiVipService.getAllHanoiVipLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiVipLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiVipService.getHanoiVipLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอย VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiVipLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiVipLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiVipService.createHanoiVipLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอย VIP สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiVipLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiVipService.updateHanoiVipLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอย VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiVipLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiVipService.deleteHanoiVipLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอย VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอย VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอย VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiVipLottery,
  getAllHanoiVipLottery,
  getHanoiVipLotteryById,
  createHanoiVipLottery,
  updateHanoiVipLottery,
  deleteHanoiVipLottery,
};
