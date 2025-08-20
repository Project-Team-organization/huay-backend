const lotteryLaoUnionService = require('../../service/lottery/lottery_lao_union.service');
const { handleSuccess, handleError } = require('../../utils/responseHandler');

class LotteryLaoUnionController {
    async fetchLatestResult(req, res) {
        try {
            const result = await lotteryLaoUnionService.fetchLatestResult();
            const response = await handleSuccess(result.data);
            return res.status(response.status).json(response);
        } catch (err) {
            const response = await handleError(err);
            return res.status(response.status).json(response);
        }
    }

    async getLatestResult(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await lotteryLaoUnionService.getLatestResult(page, limit);
            if (!result.data || result.data.length === 0) {
                const response = await handleError(new Error('No lottery results found'));
                return res.status(response.status).json(response);
            }

            const response = await handleSuccess(result.data, 'Success', 200, {
                total: result.total,
                page: result.page,
                limit: result.limit
            });
            return res.status(response.status).json(response);
        } catch (err) {
            const response = await handleError(err);
            return res.status(response.status).json(response);
        }
    }

    async getResultByDate(req, res) {
        try {
            const { date } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await lotteryLaoUnionService.getResultByDate(date, page, limit);
            if (!result.data || result.data.length === 0) {
                const response = await handleError(new Error('No lottery results found for the specified date'));
                return res.status(response.status).json(response);
            }

            const response = await handleSuccess(result.data, 'Success', 200, {
                total: result.total,
                page: result.page,
                limit: result.limit
            });
            return res.status(response.status).json(response);
        } catch (err) {
            const response = await handleError(err);
            return res.status(response.status).json(response);
        }
    }
}

module.exports = new LotteryLaoUnionController(); 