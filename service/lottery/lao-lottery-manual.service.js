const LotteryLaoHd = require("../../models/lottery_lao_hd.model");
const LotteryLaoRedcross = require("../../models/lottery_lao_redcross.model");
const LotteryLaoTv = require("../../models/lottery_lao_tv.model");
const LotteryLaoVip = require("../../models/lottery_lao_vip.model");
const LotteryLaoStarsVip = require("../../models/lottery_lao_stars_vip.model");
const LotteryLaoThakhek5d = require("../../models/lottery_lao_thakhek_5d.model");
const LotteryLaoThakhekVip = require("../../models/lottery_lao_thakhek_vip.model");
const LotteryLaoExtra = require("../../models/lotterylao.extra.model");
const LotteryLao = require("../../models/lotterylao.model");
const LotteryLaoStars = require("../../models/lotterylao.stars.model");
const LotteryLaoUnion = require("../../models/lotterylao.union.model");


exports.LotteryLaoHd = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results?.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results?.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results?.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results?.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(",");
        }

        // ➤ เตรียม betting_types
        const betting_types = [
            { code: "3top", name: "สามตัวบน", digit: threeTop },
            { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
            { code: "2top", name: "สองตัวบน", digit: twoTop },
            { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
            { code: "1top", name: "วิ่งบน", digit: oneTop },
            { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
        ];

        // ➤ สร้าง document พร้อมค่า derived + betting_types
        const doc = new LotteryLaoHd({
            ...data,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        });

        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoHd service:", error);
        throw error;
    }
};


exports.LotteryLaoRedcross = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results?.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results?.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ หา 2 ตัวพิเศษ
        let twoSpecial = "";
        if (data.results?.digit2_special) {
            twoSpecial = data.results.digit2_special;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results?.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results?.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(",");
        }

        // ➤ 1 ตัวหน้า (วิ่งหน้า จาก digit1)
        let oneFront = "";
        if (data.results?.digit1) {
            oneFront = data.results.digit1;
        }

        // ➤ เตรียม betting_types

        const betting_types = [
            { code: "3top", name: "สามตัวบน", digit: threeTop },
            { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
            { code: "2top", name: "สองตัวบน", digit: twoTop },
            { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
            { code: "2special", name: "สองตัวพิเศษ", digit: twoSpecial },
            { code: "1top", name: "วิ่งบน", digit: oneTop },
            { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            { code: "1front", name: "วิ่งหน้า", digit: oneFront },
        ];

        // ➤ สร้าง document พร้อมค่า derived + betting_types
        const doc = new LotteryLaoRedcross({
            ...data,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                twoSpecial,
                oneTop,
                oneBottom,
                oneFront,
            },
        });

        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoRedcross service:", error);
        throw error;
    }
};


exports.LotteryLaoTv = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(","); // เช่น "764" → "7,6,4"
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(","); // เช่น "24" → "2,4"
        }

        // ➤ เตรียม betting_types
        const betting_types = [
            { code: "3top", name: "สามตัวบน", digit: threeTop },
            { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
            { code: "2top", name: "สองตัวบน", digit: twoTop },
            { code: "2bot", name: "สองตัวล่าง", digit: twoBottom },
            { code: "1top", name: "วิ่งบน", digit: oneTop },
            { code: "1bot", name: "วิ่งล่าง", digit: oneBottom },
        ];


        // ➤ สร้าง document พร้อมค่า derived + betting_types
        const doc = new LotteryLaoTv({
            ...data,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        });

        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoTv service:", error);
        throw error;
    }
};

exports.LotteryLaoVip = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
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
            oneBottom = data.results.digit2_bottom.split(",").join(","); // เช่น "25" → "2,5"
        }

        const lotteryData = {
            name: data.name || "lao-lottery",
            url: data.url || "https://laosviplot.com",
            lotto_date: data.lotto_date,
            lottery_name: data.lotteryName || "หวยลาว VIP",
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit5: data.results.digit5,
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-vip",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoVip service:", error);
        throw error;
    }
};

// Stars VIP
exports.LotteryLaoStarsVip = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
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
            name: data.name || "lao-lottery",
            url: data.url || "https://api.laostars-vip.com",
            type: "vip",
            lotto_date: data.lotto_date,
            lottery_name: data.lotteryName || "หวยลาวสตาร์ VIP",
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit5: data.results.digit5,
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            scraper: data.scraper || "lao-stars-vip",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
            apiUpdate: data.apiUpdate ? new Date(data.apiUpdate) : null,
            apiNow: data.apiNow || "",
        };

        const doc = new LotteryLaoStarsVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoStarsVip service:", error);
        throw error;
    }
};


// Thakhek 5D
exports.LotteryLaoThakhek5d = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
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
            name: data.name || "lao-lottery",
            url: data.url || "https://laosthakhek.net/",
            lotto_date: data.lotto_date,
            lottery_name: data.lotteryName || "หวยลาวท่าแขก 5D",
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2bottom", name: "สองตัวบน", digit: twoTop },
                { code: "2bot", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-thakhek-5d",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoThakhek5d(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoThakhek5d service:", error);
        throw error;
    }
};


// Thakhek VIP
exports.LotteryLaoThakhekVip = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
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
            name: data.name || "lao-lottery",
            url: data.url || "https://laosthakhek.net/",
            lotto_date: data.lotto_date,
            lottery_name: data.lotteryName || "หวยลาวท่าแขก VIP",
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-thakhek-vip",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoThakhekVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoThakhekVip service:", error);
        throw error;
    }
};


// Extra
exports.LotteryLaoExtra = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(",");
        }

        const lotteryData = {
            name: data.name || "lao-extra",
            url: data.url || "https://laoextra.com",
            lotto_date: data.lotto_date,
            lottery_name: data.lotteryName || "หวยลาว EXTRA",
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit5: data.results.digit5,
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-extra",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoExtra(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoExtra service:", error);
        throw error;
    }
};


// Lao พัฒนา
exports.LotteryLao = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.numbers.digit3) {
            threeTop = data.numbers.digit3;
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.numbers.digit2_top) {
            twoTop = data.numbers.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.numbers.digit2_bottom) {
            twoBottom = data.numbers.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.numbers.digit3 && data.numbers.digit3.length === 3) {
            oneTop = data.numbers.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.numbers.digit2_bottom && data.numbers.digit2_bottom.length === 2) {
            oneBottom = data.numbers.digit2_bottom.split("").join(",");
        }

        const lotteryData = {
            name: data.name || "lao-lottery",
            url: data.url || "https://laolottery.com",
            lotto_date: data.date,
            lottery_name: data.lotteryName || "lao_lottery",
            start_spin: new Date(data.start_spin) || new Date(),
            show_result: new Date(data.show_result) || new Date(),
            results: {
                digit5: data.numbers.digit5,
                digit4: data.numbers.digit4,
                digit3: data.numbers.digit3,
                digit2_top: data.numbers.digit2_top,
                digit2_bottom: data.numbers.digit2_bottom,
                animal: data.numbers.animal,
                development: data.numbers.development,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-lottery",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLao(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLao service:", error);
        throw error;
    }
};


// Stars
exports.LotteryLaoStars = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(",");
        }

        const lotteryData = {
            name: data.name || "lao-stars",
            url: "https://test-lotto-scraper.wnimqo.easypanel.host/api/lottery/lao-stars/latest",
            type: "normal",
            lottery_name: data.lotteryName || "หวยลาวสตาร์",
            lotto_date: data.lotto_date,
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit5: data.results.digit5,
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-stars",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoStars(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoStars service:", error);
        throw error;
    }
};


// Union
exports.LotteryLaoUnion = async (data) => {
    try {
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

        // ➤ หา 2 ตัวบน
        let twoTop = "";
        if (data.results.digit2_top) {
            twoTop = data.results.digit2_top;
        }

        // ➤ หา 2 ตัวล่าง
        let twoBottom = "";
        if (data.results.digit2_bottom) {
            twoBottom = data.results.digit2_bottom;
        }

        // ➤ 1 ตัวบน (วิ่งบน จาก digit3)
        let oneTop = "";
        if (data.results.digit3 && data.results.digit3.length === 3) {
            oneTop = data.results.digit3.split("").join(",");
        }

        // ➤ 1 ตัวล่าง (วิ่งล่าง จาก digit2_bottom)
        let oneBottom = "";
        if (data.results.digit2_bottom && data.results.digit2_bottom.length === 2) {
            oneBottom = data.results.digit2_bottom.split("").join(",");
        }

        const lotteryData = {
            lotto_date: data.lotto_date,
            start_spin: data.start_spin ? new Date(data.start_spin) : null,
            show_result: data.show_result ? new Date(data.show_result) : null,
            results: {
                digit5: data.results.digit5,
                digit4: data.results.digit4,
                digit3: data.results.digit3,
                digit2_top: data.results.digit2_top,
                digit2_bottom: data.results.digit2_bottom,
            },
            url: data.url || "https://laounionlottery.com",
            name: data.name || "หวยลาว UNION",
            lottery_name: data.lotteryName || "lao_union",
            betting_types: [
                { code: "3top", name: "สามตัวบน", digit: threeTop },
                { code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") },
                { code: "2top", name: "สองตัวบน", digit: twoTop },
                { code: "2bottom", name: "สองตัวล่าง", digit: twoBottom },
                { code: "1top", name: "วิ่งบน", digit: oneTop },
                { code: "1bottom", name: "วิ่งล่าง", digit: oneBottom },
            ],
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
            scraper: data.scraper || "lao-union",
            scrapedAt: data.scrapedAt ? new Date(data.scrapedAt) : null,
        };

        const doc = new LotteryLaoUnion(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoUnion service:", error);
        throw error;
    }
};

