const responseHandler = require("../../utils/responseHandler");
const service = require("../../service/lottery/hanoi-lottery-manual.service");

// Hanoi
exports.createHanoi = async (req, res) => {
    try {
        const result = await service.LotteryHanoi(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoi:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Develop
exports.createHanoiDevelop = async (req, res) => {
    try {
        const result = await service.LotteryHanoiDevelop(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Develop created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiDevelop:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi VIP
exports.createHanoiVip = async (req, res) => {
    try {
        const result = await service.LotteryHanoiVip(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi VIP created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiVip:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Extra
exports.createHanoiExtra = async (req, res) => {
    try {
        const result = await service.LotteryHanoiExtra(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Extra created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiExtra:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Asean
exports.createHanoiAsean = async (req, res) => {
    try {
        const result = await service.LotteryHanoiAsean(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Asean created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiAsean:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi HD
exports.createHanoiHd = async (req, res) => {
    try {
        const result = await service.LotteryHanoiHd(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi HD created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiHd:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Star
exports.createHanoiStar = async (req, res) => {
    try {
        const result = await service.LotteryHanoiStar(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Star created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiStar:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi TV
exports.createHanoiTv = async (req, res) => {
    try {
        const result = await service.LotteryHanoiTv(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi TV created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiTv:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Special
exports.createHanoiSpecial = async (req, res) => {
    try {
        const result = await service.LotteryHanoiSpecial(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Special created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiSpecial:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Redcross
exports.createHanoiRedcross = async (req, res) => {
    try {
        const result = await service.LotteryHanoiRedcross(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Redcross created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiRedcross:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Hanoi Special API
exports.createHanoiSpecialApi = async (req, res) => {
    try {
        const result = await service.LotteryHanoiSpecialApi(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Hanoi Special API created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createHanoiSpecialApi:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};