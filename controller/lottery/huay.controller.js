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
        ...getTodFourFromFirstPrize(prizeFirst, lottery_set_id)
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
      code:"3d_front"
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
      code:"2d_top"
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
        code:"3d_toot"
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
        code:"3d_front_toot_2"
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
        code:"3d_bottom_toot"
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
