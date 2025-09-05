const lotteryGrandDragon4dService = require("../../service/lottery/lottery_grand_dragon_4d.service");
const responseHandler = require("../../utils/responseHandler");

// ดึงข้อมูลหวย Grand Dragon 4D ล่าสุด
const fetchLatestGrandDragon4dLottery = async (req, res) => {
  try {
    const result = await lotteryGrandDragon4dService.fetchAndSaveGrandDragon4dLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวย Grand Dragon 4D ล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestGrandDragon4dLottery controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

// ดึงข้อมูลหวย Grand Dragon 4D ทั้งหมด (พร้อม pagination)
const getAllGrandDragon4dLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryGrandDragon4dService.getAllGrandDragon4dLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวย Grand Dragon 4D สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllGrandDragon4dLottery controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

// ดึงข้อมูลหวย Grand Dragon 4D ตาม ID
const getGrandDragon4dLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response = await responseHandler.handleError(null, "กรุณาระบุ ID ของหวย Grand Dragon 4D");
      return res.status(400).json(response);
    }

    const result = await lotteryGrandDragon4dService.getGrandDragon4dLotteryById(id);
    
    if (!result) {
      const response = await responseHandler.handleError(null, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ระบุ");
      return res.status(404).json(response);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวย Grand Dragon 4D สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getGrandDragon4dLotteryById controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

// ลบข้อมูลหวย Grand Dragon 4D ตาม ID
const deleteGrandDragon4dLottery = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      const response = await responseHandler.handleError(null, "กรุณาระบุ ID ของหวย Grand Dragon 4D ที่ต้องการลบ");
      return res.status(400).json(response);
    }

    const result = await lotteryGrandDragon4dService.deleteGrandDragon4dLottery(id);
    
    if (!result) {
      const response = await responseHandler.handleError(null, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ต้องการลบ");
      return res.status(404).json(response);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวย Grand Dragon 4D สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteGrandDragon4dLottery controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

// อัพเดทข้อมูลหวย Grand Dragon 4D ตาม ID
const updateGrandDragon4dLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      const response = await responseHandler.handleError(null, "กรุณาระบุ ID ของหวย Grand Dragon 4D ที่ต้องการอัพเดท");
      return res.status(400).json(response);
    }

    const result = await lotteryGrandDragon4dService.updateGrandDragon4dLottery(id, updateData);
    
    if (!result) {
      const response = await responseHandler.handleError(null, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ต้องการอัพเดท");
      return res.status(404).json(response);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวย Grand Dragon 4D สำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateGrandDragon4dLottery controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

// สร้างข้อมูลหวย Grand Dragon 4D ใหม่
const createGrandDragon4dLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    
    const result = await lotteryGrandDragon4dService.createGrandDragon4dLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวย Grand Dragon 4D สำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createGrandDragon4dLottery controller:", error);
    const response = await responseHandler.handleError(error, error.message);
    return res.status(500).json(response);
  }
};

module.exports = {
  fetchLatestGrandDragon4dLottery,
  getAllGrandDragon4dLottery,
  getGrandDragon4dLotteryById,
  deleteGrandDragon4dLottery,
  updateGrandDragon4dLottery,
  createGrandDragon4dLottery,
};
