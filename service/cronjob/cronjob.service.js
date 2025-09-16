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

// Import services สำหรับหวย 4D
const lotteryMagnum4dService = require('../lottery/lottery_magnum_4d.service');
const lotterySingapore4dService = require('../lottery/lottery_singapore_4d.service');
const lotteryGrandDragon4dService = require('../lottery/lottery_grand_dragon_4d.service');

// Import services สำหรับหวยไทย
const lotteryThaiGsbService = require('../lottery/lottery_thai_gsb.service');
const lotteryThaiSavingsService = require('../lottery/lottery_thai_savings.service');

// Import services สำหรับหวยฮานอย
const lotteryHanoiAseanService = require('../lottery/lottery_hanoi_asean.service');
const lotteryHanoiHdService = require('../lottery/lottery_hanoi_hd.service');
const lotteryHanoiStarService = require('../lottery/lottery_hanoi_star.service');
const lotteryHanoiTvService = require('../lottery/lottery_hanoi_tv.service');
const lotteryHanoiSpecialService = require('../lottery/lottery_hanoi_special.service');
const lotteryHanoiRedcrossService = require('../lottery/lottery_hanoi_redcross.service');
const lotteryHanoiSpecialApiService = require('../lottery/lottery_hanoi_special_api.service');
const lotteryHanoiService = require('../lottery/lottery_hanoi.service');
const lotteryHanoiDevelopService = require('../lottery/lottery_hanoi_develop.service');
const lotteryHanoiVipService = require('../lottery/lottery_hanoi_vip.service');
const lotteryHanoiExtraService = require('../lottery/lottery_hanoi_extra.service');
const lotteryEgyptStockService = require('../lottery/lottery_egypt_stock.service');
const lotteryKoreanStockVipService = require('../lottery/lottery_korean_stock_vip.service');
const lotteryHangsengAfternoonService = require('../lottery/lottery_hangseng_afternoon.service');

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

// หวย Magnum 4D
exports.huaymagnum4d = async function () {
  return await retryWithDelay(
    () => lotteryMagnum4dService.fetchAndSaveMagnum4dLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวย Singapore 4D
exports.huaysingapore4d = async function () {
  return await retryWithDelay(
    () => lotterySingapore4dService.fetchAndSaveSingapore4dLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวย Grand Dragon 4D
exports.huaygranddragon4d = async function () {
  return await retryWithDelay(
    () => lotteryGrandDragon4dService.fetchAndSaveGrandDragon4dLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยไทย GSB
exports.huaythaigsb = async function () {
  return await retryWithDelay(
    () => lotteryThaiGsbService.fetchAndSaveThaiGsbLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยไทยออมสิน
exports.huaythaisavings = async function () {
  return await retryWithDelay(
    () => lotteryThaiSavingsService.fetchAndSaveThaiSavingsLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยอาเซียน
exports.huayhanoiasean = async function () {
  return await retryWithDelay(
    () => lotteryHanoiAseanService.fetchAndSaveHanoiAseanLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอย HD
exports.huayhanoihd = async function () {
  return await retryWithDelay(
    () => lotteryHanoiHdService.fetchAndSaveHanoiHdLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยสตาร์
exports.huayhanoistar = async function () {
  return await retryWithDelay(
    () => lotteryHanoiStarService.fetchAndSaveHanoiStarLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอย TV
exports.huayhanoitv = async function () {
  return await retryWithDelay(
    () => lotteryHanoiTvService.fetchAndSaveHanoiTvLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยเฉพาะกิจ
exports.huayhanoispecial = async function () {
  return await retryWithDelay(
    () => lotteryHanoiSpecialService.fetchAndSaveHanoiSpecialLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยกาชาด
exports.huayhanoiredcross = async function () {
  return await retryWithDelay(
    () => lotteryHanoiRedcrossService.fetchAndSaveHanoiRedcrossLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยพิเศษ
exports.huayhanoispecialapi = async function () {
  return await retryWithDelay(
    () => lotteryHanoiSpecialApiService.fetchAndSaveHanoiSpecialApiLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอย
exports.huayhanoi = async function () {
  return await retryWithDelay(
    () => lotteryHanoiService.fetchAndSaveHanoiLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอยพัฒนา
exports.huayhanoidevelop = async function () {
  return await retryWithDelay(
    () => lotteryHanoiDevelopService.fetchAndSaveHanoiDevelopLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอย VIP
exports.huayhanoivip = async function () {
  return await retryWithDelay(
    () => lotteryHanoiVipService.fetchAndSaveHanoiVipLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮานอย EXTRA
exports.huayhanoiextra = async function () {
  return await retryWithDelay(
    () => lotteryHanoiExtraService.fetchAndSaveHanoiExtraLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยหุ้นอิยิปต์
exports.huayegyptstock = async function () {
  return await retryWithDelay(
    () => lotteryEgyptStockService.fetchAndSaveEgyptStockLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยหุ้นเกาหลี VIP
exports.huaykoreanstockvip = async function () {
  return await retryWithDelay(
    () => lotteryKoreanStockVipService.fetchAndSaveKoreanStockVipLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}

// หวยฮั่งเส็งรอบบ่าย
exports.huayhangsengafternoon = async function () {
  return await retryWithDelay(
    () => lotteryHangsengAfternoonService.fetchAndSaveHangsengAfternoonLottery(),
    5    // รอ 5 วินาทีระหว่างการลอง
  );
}