// ========== BACKUP CRONJOBS (ฟังก์ชันเดิมโดยไม่มี LOG) ==========
// ไฟล์นี้เก็บ cronjobs เดิมไว้ในกรณีต้องการใช้โดยไม่มี logging
// สามารถคัดลอกไปใช้แทนใน cronjob_set.js ได้

const cron = require('node-cron');
const { checkLotterySetResults } = require('../service/lottery/lotterySets.service');

// ========== ฟังก์ชันที่ยังใช้งานอยู่ ==========

// ออกผลหวย ทุกนาที (สำหรับตรวจสอบผลหวยอื่นๆ)
cron.schedule('* * * * *', async () => {
    // console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ออกผลหวย ทุกนาที...`);
    await checkLotterySetResults();
}, { timezone: "Asia/Bangkok" });

// ========== CRONJOBS ที่คอมเมนต์ไว้ (ฟังก์ชันเดิมโดยไม่มี LOG) ==========

// สร้างหวย รัฐบาล (โดยไม่มี LOG)
// สร้างหวยรัฐบาลวันที่ 2 และ 17 ของทุกเดือน เวลา 00:01 น.
/*
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
*/

// สร้างหวย ออมสิน (โดยไม่มี LOG)
// สร้างหวยออมสินวันที่ 2 และ 17 ของทุกเดือน เวลา 00:01 น.
/*
cron.schedule('1 0 2,17 * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🏦 สร้างหวยออมสิน...`);
    try {
        const { createThaiSavingsLottery } = require('../service/cronjob/cronjob.service');
        await createThaiSavingsLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยออมสินสำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยออมสิน:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// สร้างหวย ธกส (โดยไม่มี LOG)
// สร้างหวย ธกส วันที่ 17 ของทุกเดือน เวลา 00:01 น.
/*
cron.schedule('1 0 17 * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🏛️ สร้างหวย ธกส...`);
    try {
        const { createThaiGsbLottery } = require('../service/cronjob/cronjob.service');
        await createThaiGsbLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวย ธกส สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย ธกส:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// ============= หวยลาว CRONJOBS ตามตารางเวลา (โดยไม่มี LOG) =============

// หวยลาว HD - สร้างเวลา 13:20 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('20 13 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาว HD...`);
    try {
        const { createLaoHdLottery } = require('../service/cronjob/cronjob.service');
        await createLaoHdLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาว HD สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว HD:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวสตาร์ - สร้างเวลา 15:00 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('0 15 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวสตาร์...`);
    try {
        const { createLaoStarsLottery } = require('../service/cronjob/cronjob.service');
        await createLaoStarsLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวสตาร์ สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสตาร์:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวท่าแขก VIP - สร้างเวลา 19:30 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('30 19 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวท่าแขก VIP...`);
    try {
        const { createLaoThakhekVipLottery } = require('../service/cronjob/cronjob.service');
        await createLaoThakhekVipLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวท่าแขก VIP สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวท่าแขก VIP:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวท่าแขก 5D - สร้างเวลา 20:55 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('55 20 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวท่าแขก 5D...`);
    try {
        const { createLaoThakhek5dLottery } = require('../service/cronjob/cronjob.service');
        await createLaoThakhek5dLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวท่าแขก 5D สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวท่าแขก 5D:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวสามัคคี - สร้างเวลา 19:50 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('50 19 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวสามัคคี...`);
    try {
        const { createLaoUnionLottery } = require('../service/cronjob/cronjob.service');
        await createLaoUnionLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวสามัคคี สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสามัคคี:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาว VIP - สร้างเวลา 21:00 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('0 21 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาว VIP...`);
    try {
        const { createLaoVipLottery } = require('../service/cronjob/cronjob.service');
        await createLaoVipLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาว VIP สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว VIP:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวสตาร์ VIP - สร้างเวลา 21:40 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('40 21 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวสตาร์ VIP...`);
    try {
        const { createLaoStarsVipLottery } = require('../service/cronjob/cronjob.service');
        await createLaoStarsVipLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวสตาร์ VIP สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสตาร์ VIP:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวกาชาด - สร้างเวลา 23:00 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('0 23 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวกาชาด...`);
    try {
        const { createLaoRedcrossLottery } = require('../service/cronjob/cronjob.service');
        await createLaoRedcrossLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวกาชาด สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวกาชาด:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาวพัฒนา - สร้างเวลา 20:20 ทุกวัน (วันจันทร์ พุธ ศุกร์) (โดยไม่มี LOG)
/*
cron.schedule('20 20 * * 1,3,5', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาวพัฒนา...`);
    try {
        const { createLaoDevelopLottery } = require('../service/cronjob/cronjob.service');
        await createLaoDevelopLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาวพัฒนา สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวพัฒนา:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาว Extra - สร้างเวลา 08:25 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('25 8 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาว Extra...`);
    try {
        const { createLaoExtraLottery } = require('../service/cronjob/cronjob.service');
        await createLaoExtraLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาว Extra สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว Extra:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยลาว TV - สร้างเวลา 10:20 ทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('20 10 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇱🇦 สร้างหวยลาว TV...`);
    try {
        const { createLaoTvLottery } = require('../service/cronjob/cronjob.service');
        await createLaoTvLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยลาว TV สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว TV:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// ============= หวย 4D CRONJOBS เปิดเที่ยงคืน (โดยไม่มี LOG) =============

// หวย Magnum 4D - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🎲 สร้างหวย Magnum 4D...`);
    try {
        const { createMagnum4dLottery } = require('../service/cronjob/cronjob.service');
        await createMagnum4dLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวย Magnum 4D สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Magnum 4D:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวย Singapore 4D - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('1 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🎲 สร้างหวย Singapore 4D...`);
    try {
        const { createSingapore4dLottery } = require('../service/cronjob/cronjob.service');
        await createSingapore4dLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวย Singapore 4D สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Singapore 4D:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวย Grand Dragon 4D - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('2 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🎲 สร้างหวย Grand Dragon 4D...`);
    try {
        const { createGrandDragon4dLottery } = require('../service/cronjob/cronjob.service');
        await createGrandDragon4dLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวย Grand Dragon 4D สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Grand Dragon 4D:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// ============= หวยฮานอย CRONJOBS เปิดเที่ยงคืน (โดยไม่มี LOG) =============

// ฮานอยอาเซียน - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('3 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างฮานอยอาเซียน...`);
    try {
        const { createHanoiAseanLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiAseanLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างฮานอยอาเซียน สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างฮานอยอาเซียน:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอย HD - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('4 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอย HD...`);
    try {
        const { createHanoiHdLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiHdLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอย HD สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย HD:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอยสตาร์ - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('5 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอยสตาร์...`);
    try {
        const { createHanoiStarLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiStarLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอยสตาร์ สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยสตาร์:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอย TV - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('6 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอย TV...`);
    try {
        const { createHanoiTvLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiTvLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอย TV สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย TV:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอยเฉพาะกิจ - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('7 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอยเฉพาะกิจ...`);
    try {
        const { createHanoiSpecialLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiSpecialLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอยเฉพาะกิจ สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยเฉพาะกิจ:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอยกาชาด - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('8 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอยกาชาด...`);
    try {
        const { createHanoiRedcrossLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiRedcrossLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอยกาชาด สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยกาชาด:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอยพิเศษ - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('9 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอยพิเศษ...`);
    try {
        const { createHanoiSpecialApiLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiSpecialApiLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอยพิเศษ สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยพิเศษ:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอย - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('10 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอย...`);
    try {
        const { createHanoiLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอย สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอยพัฒนา - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('11 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอยพัฒนา...`);
    try {
        const { createHanoiDevelopLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiDevelopLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอยพัฒนา สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยพัฒนา:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอย VIP - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('12 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอย VIP...`);
    try {
        const { createHanoiVipLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiVipLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอย VIP สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย VIP:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// หวยฮานอย EXTRA - สร้างเที่ยงคืนทุกวัน (โดยไม่มี LOG)
/*
cron.schedule('13 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] 🇻🇳 สร้างหวยฮานอย EXTRA...`);
    try {
        const { createHanoiExtraLottery } = require('../service/cronjob/cronjob.service');
        await createHanoiExtraLottery();
        console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ✅ สร้างหวยฮานอย EXTRA สำเร็จ`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย EXTRA:`, error.message);
    }
}, { timezone: "Asia/Bangkok" });
*/

// ========== วิธีการใช้งาน ==========
/*
หากต้องการกลับไปใช้ฟังก์ชันเดิม (ไม่มี LOG):

1. คัดลอกโค้ดจากไฟล์นี้ไปแทนที่ใน cronjob_set.js
2. ลบความคิดเห็น /* และ */ ออก
3. เปลี่ยน createXXXLotteryWithLog เป็น createXXXLottery

ตัวอย่าง:
แทนที่: const { createLaoHdLotteryWithLog } = require('../service/cronjob/cronjob.service');
ด้วย:   const { createLaoHdLottery } = require('../service/cronjob/cronjob.service');

แทนที่: await createLaoHdLotteryWithLog();
ด้วย:   await createLaoHdLottery();
*/

console.log('📄 ไฟล์ backup cronjobs โหลดเรียบร้อย (ฟังก์ชันทั้งหมดถูกคอมเมนต์ไว้)');
