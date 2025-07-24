const LotteryLimitedNumbers = require('../../models/lottery_limited_numbers.model');
const mongoose = require('mongoose');
const UserBet = require('../../models/userBetSchema.models'); // เพิ่ม import UserBet

exports.getAllWithPagination = async (page = 1, limit = 10, query = {}) => {
    try {
        const skip = (page - 1) * limit;
        const items = await LotteryLimitedNumbers.find(query)
            .populate('lottery_set_id')
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        const total = await LotteryLimitedNumbers.countDocuments(query);

        return {
            items,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw error;
    }
};

exports.getById = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('รูปแบบ ID ไม่ถูกต้อง');
        }
        const limitedNumber = await LotteryLimitedNumbers.findById(id)
            .populate('lottery_set_id')
        if (!limitedNumber) {
            throw new Error('ไม่พบข้อมูลเลขอั้น');
        }
        return limitedNumber;
    } catch (error) {
        throw error;
    }
};

exports.getByLotterySetId = async (lotterySetId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(lotterySetId)) {
            throw new Error('รูปแบบ ID งวดไม่ถูกต้อง');
        }
        const limitedNumbers = await LotteryLimitedNumbers.find({ lottery_set_id: lotterySetId })
            .populate('lottery_set_id')
        return limitedNumbers;
    } catch (error) {
        throw error;
    }
};

// เพิ่มฟังก์ชันสำหรับตรวจสอบเลขซ้ำ
const checkDuplicateNumber = async (lottery_set_id, number, excludeId = null) => {
    const query = {
        lottery_set_id: lottery_set_id,
        number: number
    };
    
    // ถ้ามี excludeId (กรณี update) ให้ไม่เช็คกับ document ตัวเอง
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existing = await LotteryLimitedNumbers.findOne(query);
    if (existing) {
        throw new Error(`เลข ${number} มีอยู่ในงวดนี้แล้ว`);
    }
};

exports.create = async (data) => {
    try {
        // ตรวจสอบเลขซ้ำก่อนสร้าง
        await checkDuplicateNumber(data.lottery_set_id, data.number);
        
        const limitedNumber = new LotteryLimitedNumbers(data);
        await limitedNumber.save();
        return limitedNumber;
    } catch (error) {
        throw error;
    }
};

exports.update = async (id, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('รูปแบบ ID ไม่ถูกต้อง');
        }

        // ถ้ามีการอัพเดทเลขหรืองวด ให้ตรวจสอบการซ้ำ
        if (data.number || data.lottery_set_id) {
            // ดึงข้อมูลเดิมมาก่อน
            const currentDoc = await LotteryLimitedNumbers.findById(id);
            if (!currentDoc) {
                throw new Error('ไม่พบข้อมูลเลขอั้น');
            }

            // ใช้ค่าใหม่หรือค่าเดิมในการตรวจสอบ
            const numberToCheck = data.number || currentDoc.number;
            const lotterySetIdToCheck = data.lottery_set_id || currentDoc.lottery_set_id;

            await checkDuplicateNumber(lotterySetIdToCheck, numberToCheck, id);
        }

        const limitedNumber = await LotteryLimitedNumbers.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).populate('lottery_set_id').populate('betting_type_id');
        
        if (!limitedNumber) {
            throw new Error('ไม่พบข้อมูลเลขอั้น');
        }
        return limitedNumber;
    } catch (error) {
        throw error;
    }
};

exports.delete = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('รูปแบบ ID ไม่ถูกต้อง');
        }
        const limitedNumber = await LotteryLimitedNumbers.findByIdAndDelete(id);
        if (!limitedNumber) {
            throw new Error('ไม่พบข้อมูลเลขอั้น');
        }
        return limitedNumber;
    } catch (error) {
        throw error;
    }
}; 

exports.getTopBettingNumbers = async (lotterySetId, limit = 5) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(lotterySetId)) {
            throw new Error('รูปแบบ ID งวดไม่ถูกต้อง');
        }

        // Aggregate จำนวนการแทงทั้งหมดจาก userbet
        const topBettingNumbers = await UserBet.aggregate([
            {
                $match: {
                    lottery_set_id: new mongoose.Types.ObjectId(lotterySetId)
                }
            },
            {
                $group: {
                    _id: "$number",
                    total_betting_amount: { $sum: "$amount" },
                    total_bets: { $sum: 1 }
                }
            },
            {
                $sort: { total_betting_amount: -1 }
            },
            {
                $limit: limit
            }
        ]);

        if (!topBettingNumbers || topBettingNumbers.length === 0) {
            return {
                message: 'ไม่พบข้อมูลการแทงในงวดนี้',
                data: []
            };
        }

        return {
            message: 'ดึงข้อมูลเลขที่มีการแทงสูงสุดสำเร็จ',
            data: topBettingNumbers.map(bet => ({
                number: bet._id,
                total_betting_amount: bet.total_betting_amount,
                total_bets: bet.total_bets
            }))
        };
    } catch (error) {
        throw error;
    }
}; 