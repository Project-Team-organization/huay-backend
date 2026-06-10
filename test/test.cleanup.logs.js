/**
 * test.cleanup.logs.js
 * Test ฟังก์ชันลบ cronjob logs เก่ากว่า 1 เดือน
 * รัน: node test/test.cleanup.logs.js
 */

require('dotenv').config();
const connectDB = require('../config/db');
const CronjobLog = require('../models/cronjob.log.model');

async function testCleanupLogs() {
    await connectDB();

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    console.log('\n========================================');
    console.log('🧪 TEST: Cleanup Cronjob Logs');
    console.log('========================================');
    console.log(`📅 เวลาปัจจุบัน : ${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    console.log(`📅 ลบ logs ก่อน : ${oneMonthAgo.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

    // 1. นับจำนวน logs ทั้งหมดก่อนลบ
    const totalBefore = await CronjobLog.countDocuments();
    const toDeleteCount = await CronjobLog.countDocuments({ createdAt: { $lt: oneMonthAgo } });

    console.log('\n📊 ก่อนลบ:');
    console.log(`   - logs ทั้งหมด : ${totalBefore} รายการ`);
    console.log(`   - logs เก่ากว่า 1 เดือน : ${toDeleteCount} รายการ`);

    if (toDeleteCount === 0) {
        console.log('\n⚠️  ไม่มี logs เก่ากว่า 1 เดือน → ไม่มีอะไรต้องลบ');
        console.log('========================================\n');
        process.exit(0);
    }

    // 2. ลบจริง
    const startTime = Date.now();
    const result = await CronjobLog.deleteMany({ createdAt: { $lt: oneMonthAgo } });
    const duration = Date.now() - startTime;

    // 3. นับจำนวน logs ที่เหลือหลังลบ
    const totalAfter = await CronjobLog.countDocuments();

    console.log('\n✅ ผลการลบ:');
    console.log(`   - ลบสำเร็จ   : ${result.deletedCount} รายการ`);
    console.log(`   - ใช้เวลา    : ${duration} ms`);
    console.log(`   - logs คงเหลือ: ${totalAfter} รายการ`);
    console.log('========================================\n');

    process.exit(0);
}

testCleanupLogs().catch((err) => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
