const LotterySingapore4d = require("../../models/lottery_singapore_4d.model");
const LotteryMagnum4d = require("../../models/lottery_magnum_4d.model");
const LotteryGrandDragon4d = require("../../models/lottery_grand_dragon_4d.model");

// Helper function เพื่อเพิ่ม optional fields
const addOptionalFields = (lotteryData, data) => {
    // Required fields - ใส่ค่า default หากไม่มี
    lotteryData.start_spin = data.start_spin ? new Date(data.start_spin) : new Date();
    lotteryData.show_result = data.show_result ? new Date(data.show_result) : new Date();

    // Optional fields - เพิ่มเฉพาะเมื่อมีค่า
    if (data.draw_number) lotteryData.draw_number = data.draw_number;

    return lotteryData;
};

// Helper function สำหรับสร้าง betting types สำหรับ 4D (ใช้ร่วมกันทั้ง 3 หวย)
const create4DBettingTypes = (results) => {
    const firstPrize = results.first_prize?.match(/\d+/)?.[0] || "";
    const secondPrize = results.second_prize?.match(/\d+/)?.[0] || "";
    const thirdPrize = results.third_prize?.match(/\d+/)?.[0] || "";

    const firstPrize3d = firstPrize.slice(-3);
    const secondPrize3d = secondPrize.slice(-3);
    const thirdPrize3d = thirdPrize.slice(-3);

    // รองรับทั้ง special_prizes (Magnum, Grand Dragon) และ starter_prizes (Singapore)
    const extraPrizes = results.special_prizes || results.starter_prizes || [];
    const consolationPrizes = results.consolation_prizes || [];

    return [
        {
            code: "a1_4d",
            name: "4 ตัวบน",
            digit: firstPrize ? [firstPrize] : [],
        },
        {
            code: "b1_4d",
            name: "4 ตัวล่าง",
            digit: secondPrize ? [secondPrize] : [],
        },
        {
            code: "c1_4d",
            name: "4 ตัวล่าง",
            digit: thirdPrize ? [thirdPrize] : [],
        },
        {
            code: "b_3d",
            name: "3 ตัวบน",
            digit: firstPrize3d ? [firstPrize3d] : [],
        },
        {
            code: "c_3d",
            name: "3 ตัวล่าง",
            digit: secondPrize3d ? [secondPrize3d] : [],
        },
        {
            code: "abc_n_3d",
            name: "3 ตัวล่าง",
            digit: thirdPrize3d ? [thirdPrize3d] : [],
        },
        {
            code: "a_3d",
            name: "3 ตัวรวม",
            digit: [firstPrize3d, secondPrize3d, thirdPrize3d].filter(digit => digit !== ""),
        },
        {
            code: "small_4d",
            name: "เล็ก",
            digit: [firstPrize, secondPrize, thirdPrize].filter(digit => digit !== ""),
        },
        {
            code: "big_4d",
            name: "ใหญ่",
            digit: [firstPrize, secondPrize, thirdPrize, ...extraPrizes, ...consolationPrizes].filter(digit => digit !== ""),
        },
        {
            code: "pack_5",
            name: "5 เด้ง",
            digit: [
                // small_4d
                firstPrize, secondPrize, thirdPrize,
                // big_4d
                firstPrize, secondPrize, thirdPrize, ...extraPrizes, ...consolationPrizes,
                // abc_n_3d
                thirdPrize3d,
                // a1_4d
                firstPrize,
                // a_3d
                firstPrize3d, secondPrize3d, thirdPrize3d,
            ].filter(digit => digit !== ""),
        },
    ];
};

// Singapore 4D Manual Service
exports.LotterySingapore4d = async (data) => {
    try {
        // ตรวจสอบว่ามีข้อมูลวันนี้อยู่แล้วหรือไม่
        const existingLottery = await LotterySingapore4d.findOne({
            lotto_date: data.lotto_date
        });

        if (existingLottery) {
            throw new Error(`หวย Singapore 4D วันที่ ${data.lotto_date} มีข้อมูลอยู่แล้ว`);
        }

        // เตรียม betting_types (ใช้แบบเดียวกับ scraper)
        const betting_types = create4DBettingTypes(data.results);

        let lotteryData = {
            name: data.name || "singapore-4d",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "Singapore 4D",
            results: data.results,
            betting_types,
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotterySingapore4d(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotterySingapore4d service:", error);
        throw error;
    }
};

// Magnum 4D Manual Service
exports.LotteryMagnum4d = async (data) => {
    try {
        // ตรวจสอบว่ามีข้อมูลวันนี้อยู่แล้วหรือไม่
        const existingLottery = await LotteryMagnum4d.findOne({
            lotto_date: data.lotto_date
        });

        if (existingLottery) {
            throw new Error(`หวย Magnum 4D วันที่ ${data.lotto_date} มีข้อมูลอยู่แล้ว`);
        }

        // เตรียม betting_types (ใช้แบบเดียวกับ scraper)
        const betting_types = create4DBettingTypes(data.results);

        let lotteryData = {
            name: data.name || "magnum-4d",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "Magnum 4D",
            results: data.results,
            betting_types,
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryMagnum4d(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryMagnum4d service:", error);
        throw error;
    }
};

// Grand Dragon 4D Manual Service
exports.LotteryGrandDragon4d = async (data) => {
    try {
        // ตรวจสอบว่ามีข้อมูลวันนี้อยู่แล้วหรือไม่
        const existingLottery = await LotteryGrandDragon4d.findOne({
            lotto_date: data.lotto_date
        });

        if (existingLottery) {
            throw new Error(`หวย Grand Dragon 4D วันที่ ${data.lotto_date} มีข้อมูลอยู่แล้ว`);
        }

        // เตรียม betting_types (ใช้แบบเดียวกับ scraper)
        const betting_types = create4DBettingTypes(data.results);

        let lotteryData = {
            name: data.name || "grand-dragon-4d",
            lotto_date: data.lotto_date,
            lottery_name: data.lottery_name || "Grand Dragon 4D",
            results: data.results,
            betting_types,
        };

        // เพิ่ม optional fields
        lotteryData = addOptionalFields(lotteryData, data);

        const doc = new LotteryGrandDragon4d(lotteryData);
        return await doc.save();
    } catch (error) {
        console.error("Error in LotteryGrandDragon4d service:", error);
        throw error;
    }
};