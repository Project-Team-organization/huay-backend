const huayService = require("../../service/lottery/huay.service");
const axios = require("axios");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const mongoose = require("mongoose");
const lotteryResultService = require("../../service/lottery/lottery_results.service");

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
      message: "Huay data inserted successfully",
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

// ฟังก์ชันใหม่สำหรับสร้างผลหวยแบบกรอกมือหวย
exports.createManualHuay = async (req, res) => {
  try {
    const { lottery_item_id, huays } = req.body;

    if (!lottery_item_id || !Array.isArray(huays) || !huays.length) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_item_id or huay data.",
      });
    }

    // ตรวจสอบว่า huays มี code และ number หรือไม่
    const hasRequiredFields = huays.every(huay => huay.code && huay.number);
    if (!hasRequiredFields) {
      return res.status(400).json({
        success: false,
        message: "Each huay must have code and number fields.",
      });
    }

    const result = await huayService.createManualHuay(huays, lottery_item_id);

    return res.status(200).json({
      success: true,
      message: "Manual Huay data created successfully",
      data: result,
    });
  } catch (error) {
    console.error("CreateManualHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Manual Huay data.",
      error: error.message,ป
    });
  }
};

exports.createHuayAPI = async (req, res) => {
  try {
    const { lottery_set_id } = req.body;

    if (!lottery_set_id) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_set_id.",
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
        code: "6d_top",
      });

      huayData.push(
        ...getFrontThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastFourFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastTwoFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getLastFiveFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodFourFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTodFrontThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getTopThreeFromFirstPrize(prizeFirst, lottery_set_id),
        ...getOneTopFromFirstPrize(prizeFirst, lottery_set_id)
      );
    }

    const prizeFrontThree = data.prizes.find(
      (prize) => prize.id === "prizeFrontThree"
    );
    if (prizeFrontThree && Array.isArray(prizeFrontThree.number)) {
      huayData.push({
        lottery_set_id,
        huay_name: "เลขหน้า 3 ตัว",
        huay_number: prizeFrontThree.number,
      });
    }

    huayData.push(
      ...data.runningNumbers
        .filter((running) => Array.isArray(running.number))
        .map((running) => ({
          lottery_set_id,
          huay_name: running.name,
          huay_number: running.number,
        }))
    );

    const frontThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขหน้า 3 ตัว"
    );
    if (frontThreeItem) {
      huayData.push(
        ...getTodFrontThreeFromHuayData(frontThreeItem, lottery_set_id)
      );
    }

    const backThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 3 ตัว"
    );
    if (backThreeItem) {
      huayData.push(
        ...getTodBackThreeFromHuayData(backThreeItem, lottery_set_id)
      );
    }

    const twoDigitItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 2 ตัว"
    );
    if (twoDigitItem) {
      huayData.push(
        ...getOneBottomFromFirstPrize(twoDigitItem, lottery_set_id)
      );
    }

    if (!huayData.length) {
      return res.status(400).json({
        success: false,
        message: "No valid huay data to insert.",
      });
    }

    const updatedHuayData = await renameHuayNamesAsync(huayData);
    const result = await huayService.create(updatedHuayData, lottery_set_id);

    return res.status(200).json({
      success: true,
      message: "Huay data inserted successfully",
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

exports.createThaiLotteryManual = async (req, res) => {
  try {
    const { lottery_set_id, lotto_date, prize_first, prize_front_three, prize_last_three, prize_last_two } = req.body;

    let target_set_id = lottery_set_id;
    if (!target_set_id && lotto_date) {
      const LotterySets = require("../../models/lotterySets.model");
      const lottoDateObj = new Date(lotto_date);
      const startOfDay = new Date(lottoDateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(lottoDateObj.setHours(23, 59, 59, 999));
      
      const set = await LotterySets.findOne({
        name: "หวยรัฐบาล",
        result_time: { $gte: startOfDay, $lte: endOfDay }
      });
      if (set) {
        target_set_id = set._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: `ไม่พบงวดหวยรัฐบาลไทยในวันที่ ${lotto_date} กรุณาสร้างงวดหวยก่อน`
        });
      }
    }

    if (!target_set_id || !prize_first || !prize_front_three || !prize_last_three || !prize_last_two) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lottery_set_id/lotto_date, prize_first, prize_front_three, prize_last_three, or prize_last_two.",
      });
    }

    if (prize_first.length !== 6) {
      return res.status(400).json({ success: false, message: "prize_first must be 6 digits." });
    }
    if (!Array.isArray(prize_front_three) || prize_front_three.length !== 2) {
      return res.status(400).json({ success: false, message: "prize_front_three must be an array of 2 elements." });
    }
    if (!Array.isArray(prize_last_three) || prize_last_three.length !== 2) {
      return res.status(400).json({ success: false, message: "prize_last_three must be an array of 2 elements." });
    }
    if (prize_last_two.length !== 2) {
      return res.status(400).json({ success: false, message: "prize_last_two must be 2 digits." });
    }

    const data = {
      prizes: [
        { id: "prizeFirst", name: "รางวัลที่ 1", number: [prize_first] },
        { id: "prizeFrontThree", name: "รางวัลเลขหน้า 3 ตัว", number: prize_front_three }
      ],
      runningNumbers: [
        { name: "รางวัลเลขหน้า 3 ตัว", number: prize_front_three },
        { name: "รางวัลเลขท้าย 3 ตัว", number: prize_last_three },
        { name: "รางวัลเลขท้าย 2 ตัว", number: [prize_last_two] }
      ]
    };

    const huayData = [];

    const prizeFirstObj = data.prizes.find((prize) => prize.id === "prizeFirst");
    if (prizeFirstObj && Array.isArray(prizeFirstObj.number)) {
      huayData.push({
        lottery_set_id: target_set_id,
        huay_name: prizeFirstObj.name,
        huay_number: prizeFirstObj.number,
        code: "6d_top",
      });

      huayData.push(
        ...getFrontThreeFromFirstPrize(prizeFirstObj, target_set_id),
        ...getLastFourFromFirstPrize(prizeFirstObj, target_set_id),
        ...getLastTwoFromFirstPrize(prizeFirstObj, target_set_id),
        ...getTodThreeFromFirstPrize(prizeFirstObj, target_set_id),
        ...getLastFiveFromFirstPrize(prizeFirstObj, target_set_id),
        ...getTodFourFromFirstPrize(prizeFirstObj, target_set_id),
        ...getTodFrontThreeFromFirstPrize(prizeFirstObj, target_set_id),
        ...getTopThreeFromFirstPrize(prizeFirstObj, target_set_id),
        ...getOneTopFromFirstPrize(prizeFirstObj, target_set_id)
      );
    }

    const prizeFrontThreeObj = data.prizes.find(
      (prize) => prize.id === "prizeFrontThree"
    );
    if (prizeFrontThreeObj && Array.isArray(prizeFrontThreeObj.number)) {
      huayData.push({
        lottery_set_id: target_set_id,
        huay_name: "เลขหน้า 3 ตัว",
        huay_number: prizeFrontThreeObj.number,
      });
    }

    huayData.push(
      ...data.runningNumbers
        .filter((running) => Array.isArray(running.number))
        .map((running) => ({
          lottery_set_id: target_set_id,
          huay_name: running.name,
          huay_number: running.number,
        }))
    );

    const frontThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขหน้า 3 ตัว"
    );
    if (frontThreeItem) {
      huayData.push(
        ...getTodFrontThreeFromHuayData(frontThreeItem, target_set_id)
      );
    }

    const backThreeItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 3 ตัว"
    );
    if (backThreeItem) {
      huayData.push(
        ...getTodBackThreeFromHuayData(backThreeItem, target_set_id)
      );
    }

    const twoDigitItem = huayData.find(
      (item) => item.huay_name === "รางวัลเลขท้าย 2 ตัว"
    );
    if (twoDigitItem) {
      huayData.push(
        ...getOneBottomFromFirstPrize(twoDigitItem, target_set_id)
      );
    }

    if (!huayData.length) {
      return res.status(400).json({
        success: false,
        message: "No valid huay data to insert.",
      });
    }

    const updatedHuayData = await renameHuayNamesAsync(huayData);
    const result = await huayService.create(updatedHuayData, target_set_id);

    // Trigger evaluation immediately
    const user_id = "685d483a2144647be58f9312";
    await huayService.evaluateUserBetsByLotterySet(target_set_id, user_id);

    // Update status to resulted
    const LotterySets = require("../../models/lotterySets.model");
    await LotterySets.findByIdAndUpdate(target_set_id, {
      status: "resulted",
    });

    return res.status(200).json({
      success: true,
      message: "Manual Thai Huay data inserted and evaluated successfully",
      data: result,
    });
  } catch (error) {
    console.error("CreateThaiLotteryManual Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create manual Thai lottery data.",
      error: error.message,
    });
  }
};

exports.createGsbManual = async (req, res) => {
  try {
    const { lottery_set_id, lotto_date, results } = req.body;

    let target_set_id = lottery_set_id;
    if (!target_set_id && lotto_date) {
      const LotterySets = require("../../models/lotterySets.model");
      const lottoDateObj = new Date(lotto_date);
      const startOfDay = new Date(lottoDateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(lottoDateObj.setHours(23, 59, 59, 999));
      
      const set = await LotterySets.findOne({
        name: "หวยออมสิน",
        result_time: { $gte: startOfDay, $lte: endOfDay }
      });
      if (set) {
        target_set_id = set._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: `ไม่พบงวดหวยออมสินในวันที่ ${lotto_date} กรุณาสร้างงวดหวยก่อน`
        });
      }
    }

    if (!target_set_id || !lotto_date || !results) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lottery_set_id/lotto_date or results.",
      });
    }

    const { digit7, digit6, digit5, digit4, digit3_top, digit2_top, digit2_bottom } = results;

    if (!digit7 || !digit6 || !digit5 || !digit4 || !digit3_top || !digit2_top || !digit2_bottom) {
      return res.status(400).json({
        success: false,
        message: "Missing some keys inside results object.",
      });
    }

    // ➤ หา 3 ตัวบน
    let threeTop = digit3_top;
    
    // ➤ หา 3 ตัวโต๊ด
    let threeToad = [];
    if (threeTop) {
      const digits = threeTop.split("");
      const perms = new Set();
      const permute = (arr, m = []) => {
        if (arr.length === 0) {
          perms.add(m.join(""));
        } else {
          for (let i = 0; i < arr.length; i++) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next));
          }
        }
      };
      permute(digits);
      threeToad = [...perms];
    }

    // ➤ หา 2 ตัวบน
    let twoTop = digit2_top;

    // ➤ หา 2 ตัวล่าง
    let twoBottom = digit2_bottom;
    
    // ➤ 1 ตัวบน
    let oneTop = "";
    if (threeTop && threeTop.length === 3) {
      oneTop = threeTop.split("").join(",");
    }

    // ➤ 1 ตัวล่าง
    let oneBottom = "";
    if (twoBottom && twoBottom.length === 2) {
      oneBottom = twoBottom.split("").join(",");
    }

    const betting_types = [
      { code: "3top", name: "3 ตัวบน", digit: threeTop },
      { code: "3toad", name: "3 ตัวโต๊ด", digit: threeToad.join(",") },
      { code: "2top", name: "2 ตัวบน", digit: twoTop },
      { code: "2bottom", name: "2 ตัวล่าง", digit: twoBottom },
      { code: "1top", name: "วิ่งบน", digit: oneTop },
      { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
    ];

    const LotteryThaiGsb = require("../../models/lottery_thai_gsb.model");
    const LotterySets = require("../../models/lotterySets.model");

    const set = await LotterySets.findById(target_set_id);
    if (!set) {
      return res.status(404).json({ success: false, message: "Lottery set not found." });
    }

    const lotteryData = {
      name: "thai-gsb",
      url: "",
      lotto_date,
      lottery_name: set.name || "หวยออมสิน",
      start_spin: new Date(),
      show_result: new Date(),
      results,
      betting_types,
    };

    const lottery = new LotteryThaiGsb(lotteryData);
    await lottery.save();

    // Trigger evaluation
    const user_id = "685d483a2144647be58f9312";
    await huayService.evaluateUserBetsByLotterySet(target_set_id, user_id);

    // Update status to resulted
    await LotterySets.findByIdAndUpdate(target_set_id, {
      status: "resulted",
    });

    return res.status(200).json({
      success: true,
      message: "GSB Manual lottery results saved and evaluated successfully",
      data: lottery,
    });
  } catch (error) {
    console.error("CreateGsbManual Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create manual GSB lottery data.",
      error: error.message,
    });
  }
};

exports.createSavingsManual = async (req, res) => {
  try {
    const { lottery_set_id, lotto_date, results } = req.body;

    let target_set_id = lottery_set_id;
    if (!target_set_id && lotto_date) {
      const LotterySets = require("../../models/lotterySets.model");
      const lottoDateObj = new Date(lotto_date);
      const startOfDay = new Date(lottoDateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(lottoDateObj.setHours(23, 59, 59, 999));
      
      const set = await LotterySets.findOne({
        name: "หวย ธกส",
        result_time: { $gte: startOfDay, $lte: endOfDay }
      });
      if (set) {
        target_set_id = set._id.toString();
      } else {
        return res.status(400).json({
          success: false,
          message: `ไม่พบงวดหวย ธกส ในวันที่ ${lotto_date} กรุณาสร้างงวดหวยก่อน`
        });
      }
    }

    if (!target_set_id || !lotto_date || !results) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lottery_set_id/lotto_date or results.",
      });
    }

    const { digit4_top, digit3_top, digit2_top, digit2_bottom, prize1_full, prize2_full } = results;

    if (!digit4_top || !digit3_top || !digit2_top || !digit2_bottom || !prize1_full || !prize2_full) {
      return res.status(400).json({
        success: false,
        message: "Missing some keys inside results object.",
      });
    }

    // ➤ หา 3 ตัวบน
    let threeTop = digit3_top;
    
    // ➤ หา 3 ตัวโต๊ด
    let threeToad = [];
    if (threeTop) {
      const digits = threeTop.split("");
      const perms = new Set();
      const permute = (arr, m = []) => {
        if (arr.length === 0) {
          perms.add(m.join(""));
        } else {
          for (let i = 0; i < arr.length; i++) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next));
          }
        }
      };
      permute(digits);
      threeToad = [...perms];
    }

    // ➤ หา 2 ตัวบน
    let twoTop = digit2_top;

    // ➤ หา 2 ตัวล่าง
    let twoBottom = digit2_bottom;
    
    // ➤ 1 ตัวบน
    let oneTop = "";
    if (threeTop && threeTop.length === 3) {
      oneTop = threeTop.split("").join(",");
    }

    // ➤ 1 ตัวล่าง
    let oneBottom = "";
    if (twoBottom && twoBottom.length === 2) {
      oneBottom = twoBottom.split("").join(",");
    }

    const betting_types = [
      { code: "3top", name: "3 ตัวบน", digit: threeTop },
      { code: "3toad", name: "3 ตัวโต๊ด", digit: threeToad.join(",") },
      { code: "2top", name: "2 ตัวบน", digit: twoTop },
      { code: "2bottom", name: "2 ตัวล่าง", digit: twoBottom },
      { code: "1top", name: "วิ่งบน", digit: oneTop },
      { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
    ];

    const LotteryThaiSavings = require("../../models/lottery_thai_savings.model");
    const LotterySets = require("../../models/lotterySets.model");

    const set = await LotterySets.findById(target_set_id);
    if (!set) {
      return res.status(404).json({ success: false, message: "Lottery set not found." });
    }

    const lotteryData = {
      name: "thai-savings",
      url: "",
      lotto_date,
      lottery_name: set.name || "หวย ธกส",
      start_spin: new Date(),
      show_result: new Date(),
      results,
      betting_types,
    };

    const lottery = new LotteryThaiSavings(lotteryData);
    await lottery.save();

    // Trigger evaluation
    const user_id = "685d483a2144647be58f9312";
    await huayService.evaluateUserBetsByLotterySet(target_set_id, user_id);

    // Update status to resulted
    await LotterySets.findByIdAndUpdate(target_set_id, {
      status: "resulted",
    });

    return res.status(200).json({
      success: true,
      message: "Savings Manual lottery results saved and evaluated successfully",
      data: lottery,
    });
  } catch (error) {
    console.error("CreateSavingsManual Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create manual Savings lottery data.",
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
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await huayService.evaluateUserBetsByLotterySet(
      lottery_set_id,
      user_id
    );

    const response = await handleSuccess("ตรวจผลหวยสำเร็จ", result);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการตรวจผลหวย",
      400
    );
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
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ชนะ",
      400
    );
    return res.status(response.status).json(response);
  }
};

// ดึงรายการผลรางวัลทั้งหมดของงวด
exports.getLotteryResultItems = async (req, res) => {
  try {
    const { lottery_result_id } = req.params;

    const resultItems = await huayService.getLotteryResultItems(
      lottery_result_id
    );

    const response = await handleSuccess(
      "ดึงข้อมูลผลรางวัลสำเร็จ",
      resultItems
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูลผลรางวัล",
      400
    );
    return res.status(response.status).json(response);
  }
};

exports.getLatestResultedHuay = async (req, res) => {
  try {
    const result = await huayService.getLatestResultedHuay();
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลผลหวยล่าสุดสำเร็จ",
      data: result
    });
  } catch (error) {
    console.error('Error in getLatestResultedHuay controller:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const renameHuayNamesAsync = async (huayData) => {
  try {
    const mapping = {
      "รางวัลเลขหน้า 3 ตัว": "เลขหน้า 3 ตัว",
      "รางวัลเลขท้าย 3 ตัว": "เลขท้าย 3 ตัว",
      "รางวัลเลขท้าย 2 ตัว": "เลขท้าย 2 ตัว",
    };

    return huayData.map((item) => {
      const newName = mapping[item.huay_name] || item.huay_name;
      const newItem = {
        ...item,
        huay_name: newName,
      };

      if (newName === "เลขท้าย 2 ตัว") {
        newItem.code = "2d_bottom";
      }
      if (newName === "เลขท้าย 3 ตัว") {
        newItem.code = "3d_bottom";
      }
      if (newName === "เลขหน้า 3 ตัว") {
        newItem.code = "3d_front_2";
      }

      return newItem;
    });
  } catch (error) {
    console.error("renameHuayNamesAsync error:", error);
    return huayData;
  }
};

const getFrontThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map((fullNumber) => ({
      lottery_set_id,
      huay_name: "3 ตัวหน้ารางวัลที่ 1",
      huay_number: [fullNumber.slice(0, 3)],
      code: "3d_front",
    }));
  } catch (error) {
    console.error("getFrontThreeFromFirstPrize error:", error);
    return [];
  }
};

const getLastFourFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map((fullNumber) => ({
      lottery_set_id,
      huay_name: "เลขท้าย 4 ตัวรางวัลที่หนึ่ง",
      huay_number: [fullNumber.slice(-4)],
      code: "4d_top",
    }));
  } catch (error) {
    console.error("getLastFourFromFirstPrize error:", error);
    return [];
  }
};

const getLastTwoFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map((fullNumber) => ({
      lottery_set_id,
      huay_name: "2 ตัวท้ายรางวังวัลที่ 1",
      huay_number: [fullNumber.slice(-2)],
      code: "2d_top",
    }));
  } catch (error) {
    console.error("getLastTwoFromFirstPrize error:", error);
    return [];
  }
};

const getTodThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    function generateTod3Permutations(numberStr) {
      if (!numberStr || numberStr.length !== 3) return [];

      const [a, b, c] = numberStr.split("");
      return [a + b + c, a + c + b, b + a + c, b + c + a, c + a + b, c + b + a];
    }

    const allPermutations = prizeFirst.number.flatMap((fullNumber) => {
      const lastThree = fullNumber.slice(-3);
      return generateTod3Permutations(lastThree);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "โต๊ด 3 ตัวของรางวัลที่หนึ่ง",
        huay_number: uniquePermutations,
        code: "3d_toot",
      },
    ];
  } catch (error) {
    console.error("getTodThreeFromFirstPrize error:", error);
    return [];
  }
};

const getTodFrontThreeFromHuayData = (huayDataItem, lottery_set_id) => {
  try {
    if (!huayDataItem || !Array.isArray(huayDataItem.huay_number)) return [];
    console.log("Input huay_number:", huayDataItem.huay_number);

    const generatePermutations = (str) => {
      const results = new Set();
      const arr = str.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allTodNumbers = huayDataItem.huay_number.flatMap((num) =>
      generatePermutations(num)
    );
    const uniqueTodNumbers = [...new Set(allTodNumbers)];

    return [
      {
        lottery_set_id,
        huay_name: "เลขหน้า 3 ตัวโต๊ด",
        huay_number: uniqueTodNumbers,
        code: "3d_front_toot_2",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromHuayData error:", error);
    return [];
  }
};

const getTodBackThreeFromHuayData = (huayDataItem, lottery_set_id) => {
  try {
    if (!huayDataItem || !Array.isArray(huayDataItem.huay_number)) return [];
    console.log("Input huay_number:", huayDataItem.huay_number);

    const generatePermutations = (str) => {
      const results = new Set();
      const arr = str.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allTodNumbers = huayDataItem.huay_number.flatMap((num) =>
      generatePermutations(num)
    );
    const uniqueTodNumbers = [...new Set(allTodNumbers)];

    return [
      {
        lottery_set_id,
        huay_name: "เลขท้าย 3 ตัวโต๊ด",
        huay_number: uniqueTodNumbers,
        code: "3d_bottom_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromHuayData error:", error);
    return [];
  }
};

const getLastFiveFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map((fullNumber) => ({
      lottery_set_id,
      huay_name: "เลขท้าย 5 ตัวรางวัลที่หนึ่ง",
      huay_number: [fullNumber.slice(-5)],
      code: "5d_top",
    }));
  } catch (error) {
    console.error("getLastFiveFromFirstPrize error:", error);
    return [];
  }
};

const getTodFourFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const generateTod4Permutations = (numberStr) => {
      if (!numberStr || numberStr.length !== 4) return [];

      const results = new Set();
      const arr = numberStr.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allPermutations = prizeFirst.number.flatMap((fullNumber) => {
      const lastFour = fullNumber.slice(-4);
      return generateTod4Permutations(lastFour);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "4 ตัวท้ายโต๊ด",
        huay_number: uniquePermutations,
        code: "4d_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFourFromFirstPrize error:", error);
    return [];
  }
};

const getTodFrontThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const generateTod3Permutations = (numberStr) => {
      if (!numberStr || numberStr.length !== 3) return [];

      const results = new Set();
      const arr = numberStr.split("");

      const permute = (arr, l, r) => {
        if (l === r) {
          results.add(arr.join(""));
        } else {
          for (let i = l; i <= r; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1, r);
            [arr[l], arr[i]] = [arr[i], arr[l]];
          }
        }
      };

      permute(arr, 0, arr.length - 1);
      return Array.from(results);
    };

    const allPermutations = prizeFirst.number.flatMap((fullNumber) => {
      const frontThree = fullNumber.slice(0, 3);
      return generateTod3Permutations(frontThree);
    });

    const uniquePermutations = [...new Set(allPermutations)];

    return [
      {
        lottery_set_id,
        huay_name: "3 ตัวหน้ารางวัลที่ 1 โต๊ด",
        huay_number: uniquePermutations,
        code: "3d_front_toot",
      },
    ];
  } catch (error) {
    console.error("getTodFrontThreeFromFirstPrize error:", error);
    return [];
  }
};

const getTopThreeFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    return prizeFirst.number.map((fullNumber) => ({
      lottery_set_id,
      huay_name: "3 ตัวท้ายรางวัลที่ 1",
      huay_number: [fullNumber.slice(-3)],
      code: "3d_top",
    }));
  } catch (error) {
    console.error("getTopThreeFromFirstPrize error:", error);
    return [];
  }
};

const getOneTopFromFirstPrize = (prizeFirst, lottery_set_id) => {
  try {
    if (!prizeFirst || !Array.isArray(prizeFirst.number)) return [];

    const digitSet = new Set();

    prizeFirst.number.forEach((fullNumber) => {
      const lastThree = fullNumber.slice(-3);
      lastThree.split("").forEach((digit) => digitSet.add(digit));
    });

    return [
      {
        lottery_set_id,
        huay_name: "1 ตัวท้ายรางวัลที่ 1",
        huay_number: [...digitSet],
        code: "1top",
      },
    ];
  } catch (error) {
    console.error("getOneTopFromFirstPrize error:", error);
    return [];
  }
};

const getOneBottomFromFirstPrize = (twoDigitItem, lottery_set_id) => {
  try {
    if (!twoDigitItem || !Array.isArray(twoDigitItem.huay_number)) return [];

    const digitSet = new Set();
    twoDigitItem.huay_number.forEach((number) => {
      number.split("").forEach((digit) => digitSet.add(digit));
    });

    return [
      {
        lottery_set_id,
        huay_name: "วิ่งล่าง",
        huay_number: [...digitSet],
        code: "1bottom",
      },
    ];
  } catch (error) {
    console.error("getOneBottomFromFirstPrize error:", error);
    return [];
  }
};

// ประเมินผลหวยแบบระบุตัวเลขเอง (Manual)
exports.evaluateLotteryResultsManual = async (req, res) => {
  try {
    const { lottery_set_id, results } = req.body;
    const user_id = req.user._id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!lottery_set_id || !results) {
      return res.status(400).json({
        success: false,
        message: "lottery_set_id and results are required.",
      });
    }

    const result = await huayService.evaluateUserBetsManual(
      lottery_set_id,
      results,
      user_id
    );

    const response = await handleSuccess("ออกผลหวยแบบ Manual สำเร็จ", result);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการออกผลหวยแบบ Manual",
      400
    );
    return res.status(response.status).json(response);
  }
};
