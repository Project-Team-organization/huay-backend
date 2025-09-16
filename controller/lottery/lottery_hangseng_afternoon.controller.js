const lotteryHangsengAfternoonService = require("../../service/lottery/lottery_hangseng_afternoon.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHangsengAfternoonLottery = async (req, res) => {
  try {
    const result = await lotteryHangsengAfternoonService.fetchAndSaveHangsengAfternoonLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮั่งเส็งรอบบ่ายล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHangsengAfternoonLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHangsengAfternoonLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHangsengAfternoonService.getAllHangsengAfternoonLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮั่งเส็งรอบบ่ายสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHangsengAfternoonLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHangsengAfternoonLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHangsengAfternoonService.getHangsengAfternoonLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮั่งเส็งรอบบ่าย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮั่งเส็งรอบบ่ายสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHangsengAfternoonLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHangsengAfternoonLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHangsengAfternoonService.createHangsengAfternoonLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮั่งเส็งรอบบ่ายสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHangsengAfternoonLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHangsengAfternoonLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHangsengAfternoonService.updateHangsengAfternoonLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮั่งเส็งรอบบ่าย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮั่งเส็งรอบบ่ายสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHangsengAfternoonLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHangsengAfternoonLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHangsengAfternoonService.deleteHangsengAfternoonLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮั่งเส็งรอบบ่าย", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮั่งเส็งรอบบ่ายสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHangsengAfternoonLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮั่งเส็งรอบบ่าย", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHangsengAfternoonLottery,
  getAllHangsengAfternoonLottery,
  getHangsengAfternoonLotteryById,
  createHangsengAfternoonLottery,
  updateHangsengAfternoonLottery,
  deleteHangsengAfternoonLottery,
};
