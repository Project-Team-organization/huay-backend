const cron = require('node-cron');
const CronjobLog = require('../models/cronjob.log.model');

// ลบ cronjob logs ที่เกิน 1 เดือน - รันทุกวันที่ 1 ของเดือน เวลา 03:00 น.
cron.schedule('0 3 1 * *', async () => {
    const startTime = Date.now();
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    console.log(`[${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}] 🧹 เริ่มลบ cronjob logs เก่ากว่า 1 เดือน (ก่อน ${oneMonthAgo.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })})...`);

    try {
        const result = await CronjobLog.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });

        const duration = Date.now() - startTime;
        console.log(`[${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}] ✅ ลบ cronjob logs สำเร็จ: ${result.deletedCount} รายการ (ใช้เวลา ${duration} ms)`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}] ❌ เกิดข้อผิดพลาดในการลบ cronjob logs:`, error.message);
    }
}, { timezone: 'Asia/Bangkok' });

console.log('🚀 Cleanup cronjob logs scheduled: ทุกวันที่ 1 ของเดือน เวลา 03:00 น.');
