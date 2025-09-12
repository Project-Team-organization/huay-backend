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
      
      // ตรวจสอบว่าผลหวยออกครบหรือยัง (ไม่มี "xxx")
      if (result && result.results) {
        const hasIncompleteResults = Object.values(result.results).some(value => 
          value === "xxx" || value === "" || value === null || value === undefined
        );
        
        if (!hasIncompleteResults) {
          console.log(`✅ ผลหวยออกครบแล้ว หลังจากลอง ${attempt} ครั้ง`);
          return result;
        }
        
        console.log(`⏳ ผลหวยยังไม่ออกครบ (มี "xxx") ลองใหม่ใน ${delaySeconds} วินาที (ครั้งที่ ${attempt})`);
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
    () => lotteryLaoService.fetchAndSaveLaoLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว Extra
exports.huaylaoextracronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoExtraService.fetchAndSaveLaoExtraLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสตาร์
exports.huaylaostarcronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoStarsService.fetchAndSaveLaoStarsLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสามัคคี
exports.huaylaounioncronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoUnionService.fetchLatestResult(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว HD
exports.huaylaohd = async function () {
  return await retryWithDelay(
    () => lotteryLaoHdService.fetchAndSaveLaoHdLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว VIP
exports.huaylaovip = async function () {
  return await retryWithDelay(
    () => lotteryLaoVipService.fetchAndSaveLaoVipLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวสตาร์ VIP
exports.huaylaostarvip = async function () {
  return await retryWithDelay(
    () => lotteryLaoStarsVipService.fetchAndSaveLaoStarsVipLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวกาชาด
exports.huylaogachad = async function () {
  return await retryWithDelay(
    () => lotteryLaoRedcrossService.fetchAndSaveLaoRedcrossLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวทำเนียบ 5D
exports.huaylaothakhek5d = async function () {
  return await retryWithDelay(
    () => lotteryLaoThakhek5dService.fetchAndSaveLaoThakhek5dLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาวทำเนียบ VIP
exports.huaylaothakhekvip = async function () {
  return await retryWithDelay(
    () => lotteryLaoThakhekVipService.fetchAndSaveLaoThakhekVipLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยลาว TV
exports.huaylaotv = async function () {
  return await retryWithDelay(
    () => lotteryLaoTvService.fetchAndSaveLaoTvLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}