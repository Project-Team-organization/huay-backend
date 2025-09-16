const lotteryEgyptStockService = require("../../service/lottery/lottery_egypt_stock.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestEgyptStockLottery = async (req, res) => {
  try {
    const result = await lotteryEgyptStockService.fetchAndSaveEgyptStockLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นอิยิปต์ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestEgyptStockLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllEgyptStockLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryEgyptStockService.getAllEgyptStockLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นอิยิปต์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllEgyptStockLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getEgyptStockLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryEgyptStockService.getEgyptStockLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นอิยิปต์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยหุ้นอิยิปต์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getEgyptStockLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createEgyptStockLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryEgyptStockService.createEgyptStockLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยหุ้นอิยิปต์สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createEgyptStockLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateEgyptStockLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryEgyptStockService.updateEgyptStockLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นอิยิปต์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยหุ้นอิยิปต์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateEgyptStockLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteEgyptStockLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryEgyptStockService.deleteEgyptStockLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยหุ้นอิยิปต์", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยหุ้นอิยิปต์สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteEgyptStockLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยหุ้นอิยิปต์", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestEgyptStockLottery,
  getAllEgyptStockLottery,
  getEgyptStockLotteryById,
  createEgyptStockLottery,
  updateEgyptStockLottery,
  deleteEgyptStockLottery,
};
