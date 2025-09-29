const { handleSuccess, handleError } = require("../../utils/responseHandler");
const fourDLotteryManualService = require("../../service/lottery/4d-lottery-manual.service");

// Singapore 4D Manual
exports.createSingapore4d = async (req, res) => {
    try {
        const result = await fourDLotteryManualService.LotterySingapore4d(req.body);
        const response = await handleSuccess(result);
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error);
        return res.status(response.status).json(response);
    }
};

// Magnum 4D Manual
exports.createMagnum4d = async (req, res) => {
    try {
        const result = await fourDLotteryManualService.LotteryMagnum4d(req.body);
        const response = await handleSuccess(result);
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error);
        return res.status(response.status).json(response);
    }
};

// Grand Dragon 4D Manual
exports.createGrandDragon4d = async (req, res) => {
    try {
        const result = await fourDLotteryManualService.LotteryGrandDragon4d(req.body);
        const response = await handleSuccess(result);
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error);
        return res.status(response.status).json(response);
    }
};