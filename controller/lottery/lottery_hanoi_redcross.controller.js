const lotteryHanoiRedcrossService = require("../../service/lottery/lottery_hanoi_redcross.service");
const responseHandler = require("../../utils/responseHandler");

const fetchLatestHanoiRedcrossLottery = async (req, res) => {
  try {
    const result = await lotteryHanoiRedcrossService.fetchAndSaveHanoiRedcrossLottery();
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยกาชาดล่าสุดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetchLatestHanoiRedcrossLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getAllHanoiRedcrossLottery = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await lotteryHanoiRedcrossService.getAllHanoiRedcrossLottery({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยกาชาดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllHanoiRedcrossLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

const getHanoiRedcrossLotteryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiRedcrossService.getHanoiRedcrossLotteryById(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยกาชาด", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ดึงข้อมูลหวยฮานอยกาชาดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getHanoiRedcrossLotteryById controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการดึงข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

const createHanoiRedcrossLottery = async (req, res) => {
  try {
    const lotteryData = req.body;
    const result = await lotteryHanoiRedcrossService.createHanoiRedcrossLottery(lotteryData);
    
    const response = await responseHandler.handleSuccess(result, "สร้างข้อมูลหวยฮานอยกาชาดสำเร็จ");
    return res.status(201).json(response);
  } catch (error) {
    console.error("Error in createHanoiRedcrossLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการสร้างข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

const updateHanoiRedcrossLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await lotteryHanoiRedcrossService.updateHanoiRedcrossLottery(id, updateData);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยกาชาด", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "อัพเดทข้อมูลหวยฮานอยกาชาดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateHanoiRedcrossLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการอัพเดทข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

const deleteHanoiRedcrossLottery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lotteryHanoiRedcrossService.deleteHanoiRedcrossLottery(id);
    
    if (!result) {
      const errorResponse = await responseHandler.handleError("ไม่พบข้อมูลหวยฮานอยกาชาด", "NOT_FOUND");
      return res.status(404).json(errorResponse);
    }
    
    const response = await responseHandler.handleSuccess(result, "ลบข้อมูลหวยฮานอยกาชาดสำเร็จ");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in deleteHanoiRedcrossLottery controller:", error);
    const errorResponse = await responseHandler.handleError("เกิดข้อผิดพลาดในการลบข้อมูลหวยฮานอยกาชาด", error.message);
    return res.status(500).json(errorResponse);
  }
};

module.exports = {
  fetchLatestHanoiRedcrossLottery,
  getAllHanoiRedcrossLottery,
  getHanoiRedcrossLotteryById,
  createHanoiRedcrossLottery,
  updateHanoiRedcrossLottery,
  deleteHanoiRedcrossLottery,
};
