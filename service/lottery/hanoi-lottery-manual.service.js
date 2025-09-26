const LotteryHanoi = require("../../models/lottery_hanoi.model");
const LotteryHanoiDevelop = require("../../models/lottery_hanoi_develop.model");
const LotteryHanoiVip = require("../../models/lottery_hanoi_vip.model");
const LotteryHanoiExtra = require("../../models/lottery_hanoi_extra.model");
const LotteryHanoiAsean = require("../../models/lottery_hanoi_asean.model");
const LotteryHanoiHd = require("../../models/lottery_hanoi_hd.model");
const LotteryHanoiStar = require("../../models/lottery_hanoi_star.model");
const LotteryHanoiTv = require("../../models/lottery_hanoi_tv.model");
const LotteryHanoiSpecial = require("../../models/lottery_hanoi_special.model");
const LotteryHanoiRedcross = require("../../models/lottery_hanoi_redcross.model");
const LotteryHanoiSpecialApi = require("../../models/lottery_hanoi_special_api.model");

// Hanoi
exports.LotteryHanoi = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-lottery",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอย",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoi(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoi service:", error);
        throw error;
    }
};

// Hanoi Develop
exports.LotteryHanoiDevelop = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-develop",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยพัฒนา",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiDevelop(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiDevelop service:", error);
        throw error;
    }
};
// Hanoi VIP
exports.LotteryHanoiVip = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-vip",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอย VIP",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiVip(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiVip service:", error);
        throw error;
    }
};

// Hanoi Extra
exports.LotteryHanoiExtra = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-extra",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอย Extra",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiExtra(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiExtra service:", error);
        throw error;
    }
};

// Hanoi Asean
exports.LotteryHanoiAsean = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-asean",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยอาเซียน",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiAsean(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiAsean service:", error);
        throw error;
    }
};// Hanoi HD
exports.LotteryHanoiHd = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-hd",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอย HD",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiHd(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiHd service:", error);
        throw error;
    }
};

// Hanoi Star
exports.LotteryHanoiStar = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-star",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยสตาร์",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiStar(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiStar service:", error);
        throw error;
    }
};

// Hanoi TV
exports.LotteryHanoiTv = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-tv",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอย TV",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiTv(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiTv service:", error);
        throw error;
    }
};

// Hanoi Special
exports.LotteryHanoiSpecial = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-special",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยเฉพาะกิจ",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiSpecial(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiSpecial service:", error);
        throw error;
    }
};

// Hanoi Redcross
exports.LotteryHanoiRedcross = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-redcross",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยกาชาด",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiRedcross(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiRedcross service:", error);
        throw error;
    }
};

// Hanoi Special API
exports.LotteryHanoiSpecialApi = async (data) => {
    try {
        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-special-api",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "หวยฮานอยพิเศษ API",
            draw_number: data.draw_number || "",
            results: {
                digit3_top: data.results?.digit3_top || "",
                digit2_top: data.results?.digit2_top || "",
                digit2_bottom: data.results?.digit2_bottom || "",
                prize_1st: data.results?.prize_1st || "",
                prize_2nd: data.results?.prize_2nd || "",
                prize_3rd_1: data.results?.prize_3rd_1 || "",
                prize_3rd_2: data.results?.prize_3rd_2 || "",
                prize_4th_1: data.results?.prize_4th_1 || "",
                prize_4th_2: data.results?.prize_4th_2 || "",
                prize_4th_3: data.results?.prize_4th_3 || "",
                prize_4th_4: data.results?.prize_4th_4 || "",
                prize_4th_5: data.results?.prize_4th_5 || "",
                prize_4th_6: data.results?.prize_4th_6 || "",
                prize_5th_1: data.results?.prize_5th_1 || "",
                prize_5th_2: data.results?.prize_5th_2 || "",
                prize_5th_3: data.results?.prize_5th_3 || "",
                prize_5th_4: data.results?.prize_5th_4 || "",
                prize_6th_1: data.results?.prize_6th_1 || "",
                prize_6th_2: data.results?.prize_6th_2 || "",
                prize_6th_3: data.results?.prize_6th_3 || "",
                prize_6th_4: data.results?.prize_6th_4 || "",
                prize_6th_5: data.results?.prize_6th_5 || "",
                prize_6th_6: data.results?.prize_6th_6 || "",
                prize_7th_1: data.results?.prize_7th_1 || "",
                prize_7th_2: data.results?.prize_7th_2 || "",
                prize_7th_3: data.results?.prize_7th_3 || "",
                prize_2digits_1: data.results?.prize_2digits_1 || "",
                prize_2digits_2: data.results?.prize_2digits_2 || "",
                prize_2digits_3: data.results?.prize_2digits_3 || "",
                prize_2digits_4: data.results?.prize_2digits_4 || "",
            },
            betting_types: [
                {
                    code: "4top",
                    name: "4 ตัวบน",
                    digit: prize1st ? [prize1st.slice(-4)] : [],
                },
                {
                    code: "3top",
                    name: "3 ตัวบน",
                    digit: prize1st.length >= 3 ? [prize1st.slice(-3)] : [],
                },
                {
                    code: "2top",
                    name: "2 ตัวบน",
                    digit: prize1st.length >= 2 ? [prize1st.slice(-2)] : [],
                },
                {
                    code: "2bottom",
                    name: "2 ตัวล่าง",
                    digit: prize2nd.length >= 2 ? [prize2nd.slice(-2)] : [],
                },
            ],
        };

        const doc = new LotteryHanoiSpecialApi(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryHanoiSpecialApi service:", error);
        throw error;
    }
};