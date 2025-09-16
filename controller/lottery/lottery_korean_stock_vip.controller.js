const lotteryKoreanStockVipService = require("../../service/lottery/lottery_korean_stock_vip.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestKoreanStockVipLottery = async (req, res) => {
  try {
    const result = await lotteryKoreanStockVipService.fetchAndSaveKoreanStockVipLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นเกาหลี VIP ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestKoreanStockVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllKoreanStockVipLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryKoreanStockVipService.getAllKoreanStockVipLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นเกาหลี VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllKoreanStockVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getKoreanStockVipLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryKoreanStockVipService.getKoreanStockVipLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นเกาหลี VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นเกาหลี VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getKoreanStockVipLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createKoreanStockVipLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryKoreanStockVipService.createKoreanStockVipLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยหุ้นเกาหลี VIP สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createKoreanStockVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateKoreanStockVipLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryKoreanStockVipService.updateKoreanStockVipLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นเกาหลี VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยหุ้นเกาหลี VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateKoreanStockVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteKoreanStockVipLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryKoreanStockVipService.deleteKoreanStockVipLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นเกาหลี VIP", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยหุ้นเกาหลี VIP สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteKoreanStockVipLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยหุ้นเกาหลี VIP", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestKoreanStockVipLottery,
  getAllKoreanStockVipLottery,
  getKoreanStockVipLotteryById,
  createKoreanStockVipLottery,
  updateKoreanStockVipLottery,
  deleteKoreanStockVipLottery,
};
