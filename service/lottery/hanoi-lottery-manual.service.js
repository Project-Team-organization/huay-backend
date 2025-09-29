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

// Helper function สำหรับการตรวจสอบและแปลงวันที่
const validateAndFormatDate = (dateInput, fieldName = 'lotto_date') => {
    if (!dateInput) {
        throw new Error(`${fieldName} is required`);
    }

    let date;
    if (typeof dateInput === 'string') {
        // ตรวจสอบรูปแบบ YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateInput)) {
            throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
        }
        date = new Date(dateInput + 'T00:00:00.000Z');
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        throw new Error(`${fieldName} must be a valid date string or Date object`);
    }

    // ตรวจสอบว่าเป็นวันที่ที่ถูกต้อง
    if (isNaN(date.getTime())) {
        throw new Error(`${fieldName} is not a valid date`);
    }

    // ตรวจสอบว่าไม่เป็นวันที่ในอนาคตเกินไป (เผื่อไว้ 1 วัน)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    if (date > tomorrow) {
        throw new Error(`${fieldName} cannot be more than 1 day in the future`);
    }

    // ตรวจสอบว่าไม่เป็นวันที่ในอดีตเกินไป (เผื่อไว้ 1 ปี)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (date < oneYearAgo) {
        throw new Error(`${fieldName} cannot be more than 1 year in the past`);
    }

    return date;
};

// Helper function สำหรับตรวจสอบความซ้ำซ้อนของวันที่
const checkDuplicateDate = async (Model, lotto_date, lottery_name) => {
    const existingRecord = await Model.findOne({ lotto_date });
    if (existingRecord) {
        throw new Error(`${lottery_name} สำหรับวันที่ ${lotto_date.toISOString().split('T')[0]} มีอยู่แล้ว`);
    }
};

// Hanoi
exports.LotteryHanoi = async (data) => {
    try {
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoi, validatedDate, "หวยฮานอย");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-lottery",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiDevelop, validatedDate, "หวยฮานอยพัฒนา");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-develop",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiVip, validatedDate, "หวยฮานอย VIP");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-vip",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiExtra, validatedDate, "หวยฮานอย Extra");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-extra",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiAsean, validatedDate, "หวยฮานอยอาเซียน");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-asean",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiHd, validatedDate, "หวยฮานอย HD");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-hd",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiStar, validatedDate, "หวยฮานอยสตาร์");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-star",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiTv, validatedDate, "หวยฮานอย TV");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-tv",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiSpecial, validatedDate, "หวยฮานอยเฉพาะกิจ");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-special",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiRedcross, validatedDate, "หวยฮานอยกาชาด");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-redcross",
            lotto_date: validatedDate,
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
        // ➤ ตรวจสอบและแปลงวันที่
        const validatedDate = validateAndFormatDate(data.lotto_date);
        
        // ➤ ตรวจสอบความซ้ำซ้อนของวันที่
        await checkDuplicateDate(LotteryHanoiSpecialApi, validatedDate, "หวยฮานอยพิเศษ API");

        const prize1st = data.results?.prize_1st || "";
        const prize2nd = data.results?.prize_2nd || "";

        const lotteryData = {
            name: data.name || "hanoi-special-api",
            lotto_date: validatedDate,
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