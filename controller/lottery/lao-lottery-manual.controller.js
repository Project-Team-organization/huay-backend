
const responseHandler = require("../../utils/responseHandler");
const service = require("../../service/lottery/lao-lottery-manual.service");

// HD
exports.createHd = async (req, res) => {
    try {
        const result = await service.LotteryLaoHd(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao HD created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

// Redcross
exports.createRedcross = async (req, res) => {
    try {
        const result = await service.LotteryLaoRedcross(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Redcross created successfully"
        );

        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createRedcross:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};


// TV
exports.createTv = async (req, res) => {
    try {
        const result = await service.LotteryLaoTv(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao TV created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createTv:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};


// VIP
exports.createVip = async (req, res) => {
    try {
        const result = await service.LotteryLaoVip(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao VIP created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createVip:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//start vip
exports.createStarsVip = async (req, res) => {
    try {
        const result = await service.LotteryLaoStarsVip(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Stars VIP created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createStarsVip:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//Thakhek5d
exports.createThakhek5d = async (req, res) => {
    try {
        const result = await service.LotteryLaoThakhek5d(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Thakhek 5D created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createThakhek5d:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//Thakhek vip
exports.createThakhekVip = async (req, res) => {
    try {
        const result = await service.LotteryLaoThakhekVip(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Thakhek VIP created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createThakhekVip:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//Extra
exports.createExtra = async (req, res) => {
    try {
        const result = await service.LotteryLaoExtra(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao EXTRA created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createExtra:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//lay-start
exports.createStars = async (req, res) => {
    try {
        const result = await service.LotteryLaoStars(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Stars created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createStars:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//lay-Union
exports.createUnion = async (req, res) => {
    try {
        const result = await service.LotteryLaoUnion(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao Union created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createUnion:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};

//ลาวพัฒนา
exports.createLao = async (req, res) => {
    try {
        const result = await service.LotteryLao(req.body);
        const response = await responseHandler.handleSuccess(
            result,
            "Lottery Lao created successfully"
        );
        return res.status(200).json(response);
    } catch (err) {
        console.error("Error in createLao:", err);
        const response = await responseHandler.handleError(err);
        return res.status(400).json(response);
    }
};
