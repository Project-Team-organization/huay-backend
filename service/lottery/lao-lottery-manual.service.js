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

// Helper function เพื่อสร้าง betting_types เฉพาะที่มีค่า
const createBettingTypes = (threeTop, threeToad, twoTop, twoBottom, twoSpecial, oneTop, oneBottom, oneFront) => {
    const betting_types = [];
    if (threeTop) betting_types.push({ code: "3top", name: "สามตัวบน", digit: threeTop });
    if (threeToad && threeToad.length > 0) betting_types.push({ code: "3toad", name: "สามตัวโต๊ด", digit: threeToad.join(",") });
    if (twoTop) betting_types.push({ code: "2top", name: "สองตัวบน", digit: twoTop });
    if (twoBottom) betting_types.push({ code: "2bottom", name: "สองตัวล่าง", digit: twoBottom });
    if (twoSpecial) betting_types.push({ code: "2special", name: "สองตัวพิเศษ", digit: twoSpecial });
    if (oneTop) betting_types.push({ code: "1top", name: "วิ่งบน", digit: oneTop });
    if (oneBottom) betting_types.push({ code: "1bottom", name: "วิ่งล่าง", digit: oneBottom });
    if (oneFront) betting_types.push({ code: "1front", name: "วิ่งหน้า", digit: oneFront });
    return betting_types;
};

// Helper function เพื่อเพิ่ม optional fields
const addOptionalFields = (lotteryData, data) => {
    // Required fields - ใส่ค่า default หากไม่มี
    lotteryData.start_spin = data.start_spin ? new Date(data.start_spin) : new Date();
    lotteryData.show_result = data.show_result ? new Date(data.show_result) : new Date();

    // Optional fields - เพิ่มเฉพาะเมื่อมีค่า
    if (data.url) lotteryData.url = data.url;
    if (data.type) lotteryData.type = data.type;
    if (data.scraper) lotteryData.scraper = data.scraper;
    if (data.scrapedAt) lotteryData.scrapedAt = new Date(data.scrapedAt);
    if (data.apiUpdate) lotteryData.apiUpdate = new Date(data.apiUpdate);
    if (data.apiNow) lotteryData.apiNow = data.apiNow;
    return lotteryData;
};

// Helper function สำหรับการคำนวณ permutation
const calculatePermutations = (threeTop) => {
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
    return threeToad;
};

exports.LotteryLaoHd = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-hd",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาว HD",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoHd(lotteryData);
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
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, twoSpecial, oneTop, oneBottom, oneFront);

        let lotteryData = {
            name: data.name || "lao-redcross",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาวกาชาด",
            results: data.results,
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
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoRedcross(lotteryData);
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
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-tv",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาว TV",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoTv(lotteryData);
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
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-vip",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาว VIP",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoVip service:", error);
        throw error;
    }
};

exports.LotteryLaoStarsVip = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-stars-vip",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาวสตาร์ VIP",
            results: data.results,
            betting_types,
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoStarsVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoStarsVip service:", error);
        throw error;
    }
};

exports.LotteryLaoThakhek5d = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-thakhek-5d",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาวท่าแขก 5D",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoThakhek5d(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoThakhek5d service:", error);
        throw error;
    }
};

exports.LotteryLaoThakhekVip = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-thakhek-vip",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาวท่าแขก VIP",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoThakhekVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoThakhekVip service:", error);
        throw error;
    }
};

exports.LotteryLaoExtra = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-extra",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาว EXTRA",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoExtra(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoExtra service:", error);
        throw error;
    }
};

exports.LotteryLao = async (data) => {
    try {
        // ➤ หา 3 ตัวบน (ใช้ data.results แทน data.numbers)
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-lottery",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาวพัฒนา",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLao(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLao service:", error);
        throw error;
    }
};

exports.LotteryLaoStars = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-stars",
            lottery_name: data.lottery_name || "หวยลาวสตาร์",
            lotto_date: data.lotto_date,
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoStars(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoStars service:", error);
        throw error;
    }
};

exports.LotteryLaoUnion = async (data) => {
    try {
        // ➤ หา 3 ตัวบน
        let threeTop = "";
        if (data.results?.digit3) {
            threeTop = data.results.digit3;
        }

        // ➤ หา 3 ตัวโต๊ด
        const threeToad = calculatePermutations(threeTop);

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

        // ➤ เตรียม betting_types และ lotteryData
        const betting_types = createBettingTypes(threeTop, threeToad, twoTop, twoBottom, null, oneTop, oneBottom, null);

        let lotteryData = {
            name: data.name || "lao-union",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยลาว UNION",
            results: data.results,
            betting_types,
            derived: {
                threeTop,
                threeToad,
                twoTop,
                twoBottom,
                oneTop,
                oneBottom,
            },
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryLaoUnion(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryLaoUnion service:", error);
        throw error;
    }
};