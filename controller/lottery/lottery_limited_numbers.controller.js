const LotteryLimitedNumbersService = require('../../service/lottery/lottery_limited_numbers.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

exports.getAllWithPagination = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...query } = req.query;
        const result = await LotteryLimitedNumbersService.getAllWithPagination(page, limit, query);
        const response = await handleSuccess(
            result.items,
            'ดึงข้อมูลอั้นหวยสำเร็จ',
            200,
            result.pagination
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถดึงข้อมูลอั้นหวยได้');
        return res.status(response.status).json(response);
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const limitedNumber = await LotteryLimitedNumbersService.getById(id);
        const response = await handleSuccess(
            limitedNumber,
            'ดึงข้อมูลอั้นหวยสำเร็จ',
            200
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถดึงข้อมูลอั้นหวยได้');
        return res.status(response.status).json(response);
    }
};

exports.getByLotterySetId = async (req, res) => {
    try {
        const { lotterySetId } = req.params;
        const limitedNumbers = await LotteryLimitedNumbersService.getByLotterySetId(lotterySetId);
        const response = await handleSuccess(
            limitedNumbers,
            'ดึงข้อมูลอั้นหวยสำเร็จ',
            200
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถดึงข้อมูลอั้นหวยได้');
        return res.status(response.status).json(response);
    }
};

exports.create = async (req, res) => {
    try {
        const limitedNumber = await LotteryLimitedNumbersService.create(req.body);
        const response = await handleSuccess(
            limitedNumber,
            'เพิ่มเลขอั้นสำเร็จ',
            201
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถเพิ่มเลขอั้นได้');
        return res.status(response.status).json(response);
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const limitedNumber = await LotteryLimitedNumbersService.update(id, req.body);
        const response = await handleSuccess(
            limitedNumber,
            'แก้ไขเลขอั้นสำเร็จ',
            200
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถแก้ไขเลขอั้นได้');
        return res.status(response.status).json(response);
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const limitedNumber = await LotteryLimitedNumbersService.delete(id);
        const response = await handleSuccess(
            limitedNumber,
            'ลบเลขอั้นสำเร็จ',
            200
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถลบเลขอั้นได้');
        return res.status(response.status).json(response);
    }
};

exports.getTopBettingNumbers = async (req, res) => {
    try {
        const { lotterySetId } = req.params;
        const { limit } = req.query;
        const result = await LotteryLimitedNumbersService.getTopBettingNumbers(lotterySetId, limit);
        const response = await handleSuccess(
            result.data,
            result.message,
            200
        );
        return res.status(response.status).json(response);
    } catch (error) {
        const response = await handleError(error, 'ไม่สามารถดึงข้อมูลเลขอั้นที่มีการแทงสูงสุดได้');
        return res.status(response.status).json(response);
    }
}; 
