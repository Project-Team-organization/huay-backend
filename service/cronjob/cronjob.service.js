const mongoose = require("mongoose");
const axios = require("axios");
const lotteryLaoService = require('../lottery/lottery_lao.service');
const lotteryLaoExtraService = require('../lottery/lottery_lao_extra.service');
const lotteryLaoStarsService = require('../lottery/lottery_lao_stars.service');
const lotteryLaoUnionService = require('../lottery/lottery_lao_union.service');

// Import services สำหรับหวยลาวแต่ละประเภท
const lotteryLaoHdService = require('../lottery/lottery_lao_hd.service');
const lotteryLaoVipService = require('../lottery/lottery_lao_vip.service');
const lotteryLaoStarsVipService = require('../lottery/lottery_lao_stars_vip.service');
const lotteryLaoRedcrossService = require('../lottery/lottery_lao_redcross.service');
const lotteryLaoThakhek5dService = require('../lottery/lottery_lao_thakhek_5d.service');
const lotteryLaoThakhekVipService = require('../lottery/lottery_lao_thakhek_vip.service');
const lotteryLaoTvService = require('../lottery/lottery_lao_tv.service');

// Helper function สำหรับ retry mechanism
const retryWithDelay = async (fn, delaySeconds = 5) => {
  let attempt = 1;
  
  while (true) {
    try {
      const result = await fn();
      
      // ตรวจสอบว่าผลหวยออกครบหรือยัง (ไม่มี "xxx", "xx", "xxxx", "xxxxx")
      if (result && result.results) {
        const hasIncompleteResults = Object.values(result.results).some(value => {
          if (typeof value === 'string') {
            // เช็ค "xxx", "xx", "xxxx", "xxxxx" หรือค่าว่าง
            return value.includes('xxx') || value.includes('xx') || value === "" || value === null || value === undefined;
          }
          return value === null || value === undefined;
        });
        
        if (!hasIncompleteResults) {
          console.log(`✅ ผลหวยออกครบแล้ว หลังจากลอง ${attempt} ครั้ง`);
          return result;
        }
        
        console.log(`⏳ ผลหวยยังไม่ออกครบ (มี "xxx") ลองใหม่ใน ${delaySeconds} วินาที (ครั้งที่ ${attempt})`);
        console.log(`📊 ผลปัจจุบัน:`, JSON.stringify(result.results, null, 2));
      }
      
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      attempt++;
      
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการลองครั้งที่ ${attempt}:`, error.message);
      console.log(`⏳ ลองใหม่ใน ${delaySeconds} วินาที`);
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      attempt++;
    }
  }
}

// หวยลาวพัฒนา
exports.huaylaocronjob = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoService.fetchAndSaveLaoLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว Extra
exports.huaylaoextracronjob = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoExtraService.fetchAndSaveLaoExtraLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสตาร์
exports.huaylaostarcronjob = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoStarsService.fetchAndSaveLaoStarsLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสามัคคี
exports.huaylaounioncronjob = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoUnionService.fetchLatestResult();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว HD
exports.huaylaohd = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoHdService.fetchAndSaveLaoHdLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว VIP
exports.huaylaovip = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoVipService.fetchAndSaveLaoVipLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสตาร์ VIP
exports.huaylaostarvip = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoStarsVipService.fetchAndSaveLaoStarsVipLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวกาชาด
exports.huylaogachad = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoRedcrossService.fetchAndSaveLaoRedcrossLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวทำเนียบ 5D
exports.huaylaothakhek5d = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoThakhek5dService.fetchAndSaveLaoThakhek5dLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวทำเนียบ VIP
exports.huaylaothakhekvip = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoThakhekVipService.fetchAndSaveLaoThakhekVipLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว TV
exports.huaylaotv = async function () {
  return await retryWithDelay(
    async () => {
      const result = await lotteryLaoTvService.fetchAndSaveLaoTvLottery();
      return result; // return ข้อมูลที่ได้จาก service
    },
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}