const lotteryHanoiDevelopService = require("../../service/lottery/lottery_hanoi_develop.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiDevelopLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiDevelopService.fetchAndSaveHanoiDevelopLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพัฒนาล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiDevelopLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiDevelopLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiDevelopService.getAllHanoiDevelopLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพัฒนาสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiDevelopLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiDevelopLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiDevelopService.getHanoiDevelopLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพัฒนา", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยพัฒนาสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiDevelopLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiDevelopLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiDevelopService.createHanoiDevelopLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยพัฒนาสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiDevelopLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiDevelopLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiDevelopService.updateHanoiDevelopLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพัฒนา", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยพัฒนาสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiDevelopLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiDevelopLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiDevelopService.deleteHanoiDevelopLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยพัฒนา", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยพัฒนาสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiDevelopLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยพัฒนา", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiDevelopLottery,
  getAllHanoiDevelopLottery,
  getHanoiDevelopLotteryById,
  createHanoiDevelopLottery,
  updateHanoiDevelopLottery,
  deleteHanoiDevelopLottery,
};
