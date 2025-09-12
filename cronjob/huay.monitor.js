const cron = require('node-cron');
const mongoose = require('mongoose');
const {
    huaylaocronjob,
    huaylaoextracronjob,
    huaylaostarcronjob,
    huaylaounioncronjob,
    huaylaohd,
    huaylaovip,
    huaylaostarvip,
    huylaogachad,
    huaylaothakhek5d,
    huaylaothakhekvip,
    huaylaotv
} = require('../service/cronjob/cronjob.service');

// Import models สำหรับตรวจสอบข้อมูล
const LotteryLao = require('../models/lotterylao.model');
const LotteryLaoExtra = require('../models/lotterylao.extra.model');
const LotteryLaoStars = require('../models/lotterylao.stars.model');
const LotteryLaoUnion = require('../models/lotterylao.union.model');
const LotteryLaoHd = require('../models/lottery_lao_hd.model');
const LotteryLaoVip = require('../models/lottery_lao_vip.model');
const LotteryLaoStarsVip = require('../models/lottery_lao_stars_vip.model');
const LotteryLaoRedcross = require('../models/lottery_lao_redcross.model');
const LotteryLaoThakhek5d = require('../models/lottery_lao_thakhek_5d.model');
const LotteryLaoThakhekVip = require('../models/lottery_lao_thakhek_vip.model');
const LotteryLaoTv = require('../models/lottery_lao_tv.model');

// Function สำหรับตรวจสอบข้อมูลหวยว่ามี "xxx" หรือไม่
const checkIncompleteResults = (results) => {
    if (!results || typeof results !== 'object') return false;
    
    return Object.values(results).some(value => {
        if (typeof value === 'string') {
            return value.includes('xxx') || value.includes('xx') || value === "" || value === null || value === undefined;
        }
        return value === null || value === undefined;
    });
};

// Function สำหรับตรวจสอบข้อมูลหวยลาวแต่ละประเภท
const checkLaoLotteryData = async () => {
    console.log(`\n🔍 [${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] เริ่มตรวจสอบข้อมูลหวยลาว...`);
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ตรวจสอบว่าตอนนี้เป็นเวลากลางคืนหรือไม่ (หลัง 23:00)
    const isNightTime = now.getHours() >= 23;
    
    const incompleteLotteries = [];
    
    try {
        // ตรวจสอบหวยลาวพัฒนา
        const laoData = await LotteryLao.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoData && checkIncompleteResults(laoData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวพัฒนา',
                function: huaylaocronjob,
                data: laoData,
                model: LotteryLao,
                id: laoData._id
            });
        }
        
        // ตรวจสอบหวยลาว Extra
        const laoExtraData = await LotteryLaoExtra.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoExtraData && checkIncompleteResults(laoExtraData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาว Extra',
                function: huaylaoextracronjob,
                data: laoExtraData,
                model: LotteryLaoExtra,
                id: laoExtraData._id
            });
        }
        
        // ตรวจสอบหวยลาวสตาร์
        const laoStarsData = await LotteryLaoStars.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoStarsData && checkIncompleteResults(laoStarsData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวสตาร์',
                function: huaylaostarcronjob,
                data: laoStarsData,
                model: LotteryLaoStars,
                id: laoStarsData._id
            });
        }
        
        // ตรวจสอบหวยลาวสามัคคี
        const laoUnionData = await LotteryLaoUnion.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoUnionData && checkIncompleteResults(laoUnionData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวสามัคคี',
                function: huaylaounioncronjob,
                data: laoUnionData,
                model: LotteryLaoUnion,
                id: laoUnionData._id
            });
        }
        
        // ตรวจสอบหวยลาว HD
        const laoHdData = await LotteryLaoHd.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoHdData && checkIncompleteResults(laoHdData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาว HD',
                function: huaylaohd,
                data: laoHdData,
                model: LotteryLaoHd,
                id: laoHdData._id
            });
        }
        
        // ตรวจสอบหวยลาว VIP
        const laoVipData = await LotteryLaoVip.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoVipData && checkIncompleteResults(laoVipData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาว VIP',
                function: huaylaovip,
                data: laoVipData,
                model: LotteryLaoVip,
                id: laoVipData._id
            });
        }
        
        // ตรวจสอบหวยลาวสตาร์ VIP
        const laoStarsVipData = await LotteryLaoStarsVip.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoStarsVipData && checkIncompleteResults(laoStarsVipData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวสตาร์ VIP',
                function: huaylaostarvip,
                data: laoStarsVipData,
                model: LotteryLaoStarsVip,
                id: laoStarsVipData._id
            });
        }
        
        // ตรวจสอบหวยลาวกาชาด
        const laoRedcrossData = await LotteryLaoRedcross.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoRedcrossData && checkIncompleteResults(laoRedcrossData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวกาชาด',
                function: huylaogachad,
                data: laoRedcrossData,
                model: LotteryLaoRedcross,
                id: laoRedcrossData._id
            });
        }
        
        // ตรวจสอบหวยลาวท่าแขก 5D
        const laoThakhek5dData = await LotteryLaoThakhek5d.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoThakhek5dData && checkIncompleteResults(laoThakhek5dData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวท่าแขก 5D',
                function: huaylaothakhek5d,
                data: laoThakhek5dData,
                model: LotteryLaoThakhek5d,
                id: laoThakhek5dData._id
            });
        }
        
        // ตรวจสอบหวยลาวท่าแขก VIP
        const laoThakhekVipData = await LotteryLaoThakhekVip.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoThakhekVipData && checkIncompleteResults(laoThakhekVipData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาวท่าแขก VIP',
                function: huaylaothakhekvip,
                data: laoThakhekVipData,
                model: LotteryLaoThakhekVip,
                id: laoThakhekVipData._id
            });
        }
        
        // ตรวจสอบหวยลาว TV
        const laoTvData = await LotteryLaoTv.findOne({ 
            createdAt: { $gte: today } 
        }).sort({ createdAt: -1 });
        
        if (laoTvData && checkIncompleteResults(laoTvData.results)) {
            incompleteLotteries.push({
                name: 'หวยลาว TV',
                function: huaylaotv,
                data: laoTvData,
                model: LotteryLaoTv,
                id: laoTvData._id
            });
        }
        
        // แสดงผลการตรวจสอบ
        if (incompleteLotteries.length > 0) {
            console.log(`⚠️  พบข้อมูลหวยที่ไม่ครบถ้วน ${incompleteLotteries.length} ตัว:`);
            incompleteLotteries.forEach((lottery, index) => {
                console.log(`   ${index + 1}. ${lottery.name}`);
                console.log(`      📊 ผลปัจจุบัน:`, JSON.stringify(lottery.data.results, null, 6));
            });
            
            // ยิงเช็คข้อมูลหวยที่ไม่ครบถ้วน
            if (isNightTime) {
                console.log(`\n🌙 เวลากลางคืน (หลัง 23:00) - ยิง function จริงๆ ของหวยแต่ละตัว...`);
            } else {
                console.log(`\n🔄 เริ่มยิงเช็คข้อมูลหวยที่ไม่ครบถ้วน...`);
            }
            
            for (const lottery of incompleteLotteries) {
                try {
                    if (isNightTime) {
                        console.log(`\n🌙 ยิง function จริงๆ ของ ${lottery.name}...`);
                    } else {
                        console.log(`\n📡 ยิงเช็ค ${lottery.name}...`);
                    }
                    
                    // ยิง function เพื่อดึงข้อมูลใหม่
                    const newData = await lottery.function();
                    
                    // ตรวจสอบว่าข้อมูลใหม่ครบถ้วนหรือไม่
                    if (newData && newData.results && !checkIncompleteResults(newData.results)) {
                        console.log(`✅ ${lottery.name} ได้ข้อมูลใหม่ครบถ้วนแล้ว!`);
                        
                        // อัพเดทข้อมูลตัวเดิมในฐานข้อมูล
                        try {
                            await lottery.model.findByIdAndUpdate(lottery.id, {
                                results: newData.results,
                                updatedAt: new Date()
                            });
                            console.log(`🔄 อัพเดทข้อมูล ${lottery.name} ในฐานข้อมูลเรียบร้อย`);
                        } catch (updateError) {
                            console.error(`❌ เกิดข้อผิดพลาดในการอัพเดทข้อมูล ${lottery.name}:`, updateError.message);
                        }
                    } else {
                        console.log(`⏳ ${lottery.name} ยังได้ข้อมูลไม่ครบถ้วน ยังมี "xxx" อยู่`);
                    }
                    
                    if (isNightTime) {
                        console.log(`✅ เสร็จสิ้นการยิง function จริงๆ ของ ${lottery.name}`);
                    } else {
                        console.log(`✅ เสร็จสิ้นการเช็ค ${lottery.name}`);
                    }
                } catch (error) {
                    if (isNightTime) {
                        console.error(`❌ เกิดข้อผิดพลาดในการยิง function จริงๆ ของ ${lottery.name}:`, error.message);
                    } else {
                        console.error(`❌ เกิดข้อผิดพลาดในการเช็ค ${lottery.name}:`, error.message);
                    }
                }
            }
            
        } else {
            console.log(`✅ ข้อมูลหวยลาวทั้งหมดครบถ้วนแล้ว!`);
        }
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบข้อมูลหวยลาว:', error.message);
    }
};

// ===== CRONJOB สำหรับตรวจสอบข้อมูลหวยลาว =====

// ตรวจสอบข้อมูลหวยลาวทุกนาทีตลอด 24 ชั่วโมง
cron.schedule('* * * * *', async () => {
    console.log(`\n🔍 [${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] Monitor - ตรวจสอบทุกนาที`);
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Lao Lottery Monitor Cronjob Started!');
console.log('📅 Schedule: ทุกนาทีตลอด 24 ชั่วโมง');
