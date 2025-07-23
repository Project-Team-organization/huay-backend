const huayService = require("../../service/lottery/huay.service");
const axios = require("axios");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const mongoose = require("mongoose");
const lotteryResultService = require('../../service/lottery/lottery_results.service');

exports.createHuay = async (req, res) => {
  try {
    const { lottery_item_id, huays } = req.body;

    if (!lottery_item_id || !Array.isArray(huays) || !huays.length) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_item_id or huay data.",
      });
    }

    const payload = huays.map((huay) => ({
      lottery_item_id,
      huay_name: huay.huay_name || "",
      huay_number: Array.isArray(huay.huay_number)
        ? huay.huay_number
        : [huay.huay_number],
      reward: huay.reward || "",
    }));

    const result = await huayService.create(payload, lottery_item_id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Huay data.",
      error: error.message,
    });
  }
};

exports.createHuayAPI = async (req, res) => {
  try {
    const { lottery_set_id } = req.body;

    if (!lottery_set_id) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_set_id .",
      });
    }

    const response = await axios.get("https://lotto.api.rayriffy.com/latest");
    const data = response.data?.response;

    if (!data || !data.prizes || !data.runningNumbers) {
      return res.status(400).json({
        success: false,
        message: "No prize or runningNumbers data found from external API.",
      });
    }

    const huayData = [];

    const prizeFirst = data.prizes.find((prize) => prize.id === "prizeFirst");
    if (prizeFirst && Array.isArray(prizeFirst.number)) {
      huayData.push({
        lottery_set_id,
        huay_name: prizeFirst.name,
        huay_number: prizeFirst.number,
        reward: prizeFirst.reward,
      });
    }

    data.runningNumbers.forEach((running) => {
      if (Array.isArray(running.number)) {
        huayData.push({
          lottery_set_id,
          huay_name: running.name,
          huay_number: running.number,
          reward: running.reward,
        });
      }
    });

    if (!huayData.length) {
      return res.status(400).json({
        success: false,
        message: "No valid huay data to insert.",
      });
    }

    const result = await huayService.create(huayData, lottery_set_id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Huay data.",
      error: error.message,
    });
  }
};

exports.getHuay = async (req, res) => {
  try {
    const lottery_set_id = req.params.id;

    if (!lottery_set_id || lottery_set_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "No lottery_set_id provided.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lottery_set_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lottery_set_id format.",
      });
    }

    const huays = await huayService.getHuay(lottery_set_id);

    if (!huays || huays.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Not found data.",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Huay data retrieved successfully.",
      data: huays,
    });
  } catch (error) {
    console.error("GetHuay Error:", error.message);
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Unable to retrieve Huay data.",
      error: error.message,
    });
  }
};

exports.getAllHuay = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { huays, pagination } = await huayService.getAllHuay(page, limit);

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Huay data retrieved successfully.",
      data: huays,
      pagination,
    });
  } catch (error) {
    console.error("GetAllHuay Error:", error.message);
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Unable to retrieve Huay data.",
      error: error.message,
    });
  }
};

exports.getHuayById = async (req, res) => {
  try {
    const huayId = req.params.id;
    const huay = await huayService.getHuayById(huayId);
    if (!huay) {
      return res.status(404).json({
        success: false,
        message: "Huay data not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Huay data retrieved successfully.",
      data: huay,
    });
  } catch (error) {
    console.error("GetHuayById Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to retrieve Huay data.",
      error: error.message,
    });
  }
};

exports.updateHuay = async (req, res) => {
  try {
    const huayId = req.params.id;
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== "") {
        updateData[key] = req.body[key];
      }
    });

    const updatedHuay = await huayService.updateHuay(huayId, updateData);
    if (!updatedHuay) {
      return res.status(404).json({
        success: false,
        message: "Huay data not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Huay data updated successfully.",
      data: updatedHuay,
    });
  } catch (error) {
    console.error("UpdateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to update Huay data.",
      error: error.message,
    });
  }
};

// ประกาศผลหวยและค้นหาผู้ชนะ
exports.evaluateLotteryResults = async (req, res) => {
  try {
    const { lottery_set_id } = req.query;
    const user_id = req.user._id;
    if(!user_id){
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await huayService.evaluateUserBetsByLotterySet(lottery_set_id, user_id);
    
    const response = await handleSuccess("ตรวจผลหวยสำเร็จ", result);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการตรวจผลหวย", 400);
    return res.status(response.status).json(response);
  }
};

// ดึงรายการผู้ชนะทั้งหมด
exports.getLotteryWinners = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    
    const winners = await huayService.getLotteryWinners(lottery_result_id);
    
    const response = await handleSuccess("ดึงข้อมูลผู้ชนะสำเร็จ", winners);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ชนะ", 400);
    return res.status(response.status).json(response);
  }
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;
    
    const resultItems = await huayService.getLotteryResultItems(lottery_result_id);
    
    const response = await handleSuccess("ดึงข้อมูลผลรางวัลสำเร็จ", resultItems);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลผลรางวัล", 400);
    return res.status(response.status).json(response);
  }
};
