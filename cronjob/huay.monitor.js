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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
                data: laoData
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
                data: laoExtraData
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
                data: laoStarsData
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
                data: laoUnionData
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
                data: laoHdData
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
                data: laoVipData
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
                data: laoStarsVipData
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
                data: laoRedcrossData
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
                data: laoThakhek5dData
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
                data: laoThakhekVipData
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
                data: laoTvData
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
            console.log(`\n🔄 เริ่มยิงเช็คข้อมูลหวยที่ไม่ครบถ้วน...`);
            
            for (const lottery of incompleteLotteries) {
                try {
                    console.log(`\n📡 ยิงเช็ค ${lottery.name}...`);
                    await lottery.function();
                    console.log(`✅ เสร็จสิ้นการเช็ค ${lottery.name}`);
                } catch (error) {
                    console.error(`❌ เกิดข้อผิดพลาดในการเช็ค ${lottery.name}:`, error.message);
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

// 🧪 ทดสอบ: ตรวจสอบข้อมูลหวยลาวทุกนาที
cron.schedule('* * * * *', async () => {
    console.log(`\n🧪 [${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ทดสอบ Monitor - ตรวจสอบทุกนาที`);
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุก 30 นาที
cron.schedule('*/30 * * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุก 2 ชั่วโมง
cron.schedule('0 */2 * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุกวันเวลา 06:00 น.
cron.schedule('0 6 * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุกวันเวลา 12:00 น.
cron.schedule('0 12 * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุกวันเวลา 18:00 น.
cron.schedule('0 18 * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

// ตรวจสอบข้อมูลหวยลาวทุกวันเวลา 23:59 น.
cron.schedule('59 23 * * *', async () => {
    await checkLaoLotteryData();
}, { timezone: "Asia/Bangkok" });

console.log('🚀 Lao Lottery Monitor Cronjob Started!');
console.log('🧪 ทดสอบ: ทุกนาที');
console.log('📅 Schedule: Every minute, Every 30 minutes, Every 2 hours, and Daily at 06:00, 12:00, 18:00, 23:59');
