const LotteryType = require("../../models/lotteryType.model");
const LotterySets = require("../../models/lotterySets.model");
const huay = require("../../models/huay.model");

exports.createLotteryType = async (data) => {
  try {
    const exists = await LotteryType.findOne({
      lottery_type: data.lottery_type,
    });
    if (exists) {
      throw new Error("Lottery type นี้มีอยู่แล้ว");
    }

    const newBettingType = await LotteryType.create(data);
    return newBettingType;
  } catch (error) {
    console.error("Service Error - createLotteryType:", error.message);
    throw new Error("Failed to create betting type: " + error.message);
  }
};
exports.getLotteryType = async function () {
  return await LotteryType.find();
};

exports.deleteLotteryType = async function (typeId) {
  try {
    const deletedtype = await LotteryType.findByIdAndDelete(typeId);

    if (!deletedtype) {
      throw new Error("Lottery type not found.");
    }

    await LotterySets.deleteMany({ lottery_type_id: typeId });
    // await huay.deleteMany({ lottery_category_id: typeId });

    return deletedtype;
  } catch (error) {
    console.error("Error deleting lottery type:", error.message);
    throw error;
  }
};

exports.updateLotteryType = async function (Id, data) {
  try {
    const updatedCategory = await LotteryType.findByIdAndUpdate(Id, data, {
      new: true,
    });

    if (!updatedCategory) {
      throw new Error("Lottery Type not found.");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Error updating lottery Type:", error.message);
    throw error;
  }
};
