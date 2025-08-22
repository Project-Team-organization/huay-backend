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

            console.log(response.data);
            if (response.data.success) {
                const data = response.data.data;
                
                // ➤ หา 3 ตัวบน
                let threeTop = "";
                if (data.results.digit3) {
                    threeTop = data.results.digit3;
                }
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

                // ➤ หา 2 ตัวบน (2 หลักท้ายของ digit4)
                let twoTop = "";
                if (data.results.digit2_top) {
                    twoTop = data.results.digit2_top;
                }

                // ➤ หา 2 ตัวล่าง (2 หลักหน้า ของ digit4)
                let twoBottom = "";
                if (data.results.digit2_bottom) {
                    twoBottom = data.results.digit2_bottom;
                }
                // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
                let oneTop = "";
                if (data.results.digit3 && data.results.digit3.length === 3) {
                    oneTop = data.results.digit3.split("").join(","); // เช่น "234" → "2,3,4"
                }

                // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
                let oneBottom = "";
                if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
                    oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "25" → "2,5"
                }
                
                const lotteryData = {
                    lotto_date: data.lotto_date,
                    start_spin: new Date(data.start_spin),
                    show_result: new Date(data.show_result),
                    results: data.results,
                    url: data.url,
                    name: data.name,
                    lottery_name: data.lotteryName,
                    betting_types: [
                        {
                            code: "3top",
                            name: "3 ตัวบน",
                            digit: threeTop,
                        },
                        {
                            code: "3toad",
                            name: "3 ตัวโต๊ด",
                            digit: threeToad.join(","),
                        },
                        {
                            code: "2top",
                            name: "2 ตัวบน",
                            digit: twoTop,
                        },
                        {
                            code: "2bottom",
                            name: "2 ตัวล่าง",
                            digit: twoBottom,
                        },
                        {
                            code: "1top",
                            name: "วิ่งบน",
                            digit: oneTop,
                        },
                        {
                            code: "1bottom",
                            name: "วิ่งล่าง",
                            digit: oneBottom,
                        },
                    ]
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