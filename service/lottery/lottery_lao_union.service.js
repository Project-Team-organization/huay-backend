const axios = require('axios');
const LotteryLaoUnion = require('../../models/lotterylao.union.model');
const Logger = require('../../utils/logger');

class LotteryLaoUnionService {
    constructor() {
        this.apiUrl = 'https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-union/latest';
    }

    async fetchLatestResult() {
        try {
            const response = await axios.get(this.apiUrl);
            if (response.data.success) {
                const data = response.data.data;
                
                const lotteryData = {
                    lotto_date: data.lotto_date,
                    start_spin: new Date(data.start_spin),
                    show_result: new Date(data.show_result),
                    results: data.results,
                    url: data.url,
                    name: data.name,
                    lottery_name: data.lotteryName,
                    betting_types: []
                };

                // บันทึกหรืออัพเดทผลหวย
                const existingResult = await LotteryLaoUnion.findOne({ lotto_date: data.lotto_date });
                if (existingResult) {
                    await LotteryLaoUnion.findByIdAndUpdate(existingResult._id, lotteryData);
                } else {
                    await LotteryLaoUnion.create(lotteryData);
                }

                return { success: true, data: lotteryData };
            }
            throw new Error('Failed to fetch lottery data');
        } catch (error) {
            throw error;
        }
    }

    async getLatestResult(page = 1, limit = 10) {
        try {
            const total = await LotteryLaoUnion.countDocuments();
            const data = await LotteryLaoUnion.find()
                .sort({ lotto_date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            
            return {
                success: true,
                data,
                total,
                page,
                limit
            };
        } catch (error) {
            throw error;
        }
    }

    async getResultByDate(date, page = 1, limit = 10) {
        try {
            const query = { lotto_date: date };
            const total = await LotteryLaoUnion.countDocuments(query);
            const data = await LotteryLaoUnion.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            return {
                success: true,
                data,
                total,
                page,
                limit
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new LotteryLaoUnionService(); 