const userService = require("../../../service/user/lottery/lottery.service");
const huayService = require("../../../service/lottery/huay.service");


exports.getLotteryUserSets = async (req, res) => {
  try {
    const lotteries = await userService.getLotteryUserSets(req.query);
    return res.status(200).json({
      success: true,
      message: "Lottery Sets User retrieved successfully.",
      data: lotteries,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery items.",
      error: error.message,
    });
  }
};

exports.getLotteryUserSetsById = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const lottery = await userService.getLotteryUserSetsById(lotteryId);
    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery Sets User not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery Sets retrieved successfully.",
      data: lottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery Sets.",
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
