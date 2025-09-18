const cron = require('node-cron');
const { checkLotterySetResults } = require('../service/lottery/lotterySets.service');

// ออกผลหวย ทุกนาที (สำหรับตรวจสอบผลหวยอื่นๆ)
cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ออกผลหวย ทุกนาที...`);
    await checkLotterySetResults();
}, { timezone: "Asia/Bangkok" });


// สร้างหวย รัฐบาล
// สร้างหวยรัฐบาลวันที่ 2 และ 17 ของทุกเดือน เวลา 00:01 น.
cron.schedule('1 0 2,17 * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🏛️ สร้างหวยรัฐบาล...`);
    try {
        const { createThaiGovernmentLottery } = require('../service/cronjob/cronjob.service');
        await createThaiGovernmentLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยรัฐบาลสำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยรัฐบาล:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
