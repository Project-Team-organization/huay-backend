const lotteryGrandDragon4dService = require("../../service/lottery/lottery_grand_dragon_4d.service");
const responseHandler = require("../../utils/responseHandler");

// ดึงข้อมูลหวย Grand Dragon 4D ล่าสุด
const fetchLatestGrandDragon4dLottery = async (req, res) => {
  try {
    const result = await lotteryGrandDragon4dService.fetchAndSaveGrandDragon4dLottery();
    return responseHandler.success(res, "ดึงข้อมูลหวย Grand Dragon 4D ล่าสุดสำเร็จ", result);
  } catch (error) {
    console.error("Error in getLatestGrandDragon4dLottery controller:", error);
    return responseHandler.error(res, error.message);
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
    
    return responseHandler.success(res, "ดึงข้อมูลหวย Grand Dragon 4D สำเร็จ", result);
  } catch (error) {
    console.error("Error in getAllGrandDragon4dLottery controller:", error);
    return responseHandler.error(res, error.message);
  }
};

// ดึงข้อมูลหวย Grand Dragon 4D ตาม ID
const getGrandDragon4dLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return responseHandler.error(res, "กรุณาระบุ ID ของหวย Grand Dragon 4D");
    }

    const result = await lotteryGrandDragon4dService.getGrandDragon4dLotteryById(id);
    
    if (!result) {
      return responseHandler.error(res, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ระบุ");
    }
    
    return responseHandler.success(res, "ดึงข้อมูลหวย Grand Dragon 4D สำเร็จ", result);
  } catch (error) {
    console.error("Error in getGrandDragon4dLotteryById controller:", error);
    return responseHandler.error(res, error.message);
  }
};

// ลบข้อมูลหวย Grand Dragon 4D ตาม ID
const deleteGrandDragon4dLottery = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return responseHandler.error(res, "กรุณาระบุ ID ของหวย Grand Dragon 4D ที่ต้องการลบ");
    }

    const result = await lotteryGrandDragon4dService.deleteGrandDragon4dLottery(id);
    
    if (!result) {
      return responseHandler.error(res, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ต้องการลบ");
    }
    
    return responseHandler.success(res, "ลบข้อมูลหวย Grand Dragon 4D สำเร็จ", result);
  } catch (error) {
    console.error("Error in deleteGrandDragon4dLottery controller:", error);
    return responseHandler.error(res, error.message);
  }
};

// อัพเดทข้อมูลหวย Grand Dragon 4D ตาม ID
const updateGrandDragon4dLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return responseHandler.error(res, "กรุณาระบุ ID ของหวย Grand Dragon 4D ที่ต้องการอัพเดท");
    }

    const result = await lotteryGrandDragon4dService.updateGrandDragon4dLottery(id, updateData);
    
    if (!result) {
      return responseHandler.error(res, "ไม่พบข้อมูลหวย Grand Dragon 4D ที่ต้องการอัพเดท");
    }
    
    return responseHandler.success(res, "อัพเดทข้อมูลหวย Grand Dragon 4D สำเร็จ", result);
  } catch (error) {
    console.error("Error in updateGrandDragon4dLottery controller:", error);
    return responseHandler.error(res, error.message);
  }
};

// สร้างข้อมูลหวย Grand Dragon 4D ใหม่
const createGrandDragon4dLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    
    const result = await lotteryGrandDragon4dService.createGrandDragon4dLottery(lotteryData);
    
    return responseHandler.success(res, "สร้างข้อมูลหวย Grand Dragon 4D สำเร็จ", result);
  } catch (error) {
    console.error("Error in createGrandDragon4dLottery controller:", error);
    return responseHandler.error(res, error.message);
  }
};

// Function สำหรับ routes (ตามรูปแบบของตัวอื่นๆ)


module.exports = {
  getAllGrandDragon4dLottery,
  getGrandDragon4dLotteryById,
  deleteGrandDragon4dLottery,
  updateGrandDragon4dLottery,
  createGrandDragon4dLottery,
  fetchLatestGrandDragon4dLottery, // เพิ่ม function นี้เพื่อให้ routes ใช้งานได้
};
