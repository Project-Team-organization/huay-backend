const mongoose = require("mongoose");
const axios = require("axios");
const CronjobLog = require("../../models/cronjob.log.model");

// ฟังก์ชันสำหรับบันทึก log การทำงานของ cronjob
const logCronjobExecution = async (
  jobName,
  lotteryName,
  status,
  result = null,
  error = null,
  startTime = Date.now()
) => {
  try {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logData = {
      job_name: jobName,
      lottery_name: lotteryName,
      status: status, // 'success' หรือ 'error'
      execution_time: new Date(startTime),
      duration_ms: duration,
    };

    if (status === "success" && result) {
      logData.lottery_set_id = result.id || result._id;
      logData.additional_info = {
        result_time: result.result_time,
        open_time: result.openTime,
        close_time: result.closeTime,
      };
    }

    if (status === "error" && error) {
      logData.error_message = error.message || error.toString();
      logData.additional_info = {
        stack: error.stack,
        error_details: error,
      };
    }

    await CronjobLog.create(logData);
    console.log(`📊 บันทึก log ${jobName}: ${status} (${duration}ms)`);
  } catch (logError) {
    console.error(
      "❌ เกิดข้อผิดพลาดในการบันทึก cronjob log:",
      logError.message
    );
  }
};

// ===================== Time Helpers (Server-time aligned) =====================
// หมายเหตุ: เวลาที่กำหนดในเอกสารเป็นเวลาไทย (Asia/Bangkok, UTC+7)
// โค้ดนี้จะแปลงเวลาไทยให้เป็น timestamp เดียวกันในโซนเวลาของเซิร์ฟเวอร์
// โดยใช้ Date.UTC เพื่อสร้างเวลาแบบ UTC จากคอมโพเนนต์ของเวลาไทย

// คืนค่า Date ที่แทน "วันเดียวกับ baseDate ตามเวลาไทย" และเวลาชั่วโมง/นาทีที่ระบุ (เวลาไทย)
function getBangkokDateAt(hoursThai, minutesThai, baseDate = new Date()) {
  // แปลง baseDate เป็นวันที่ในเวลาไทย
  const bangkokDateStr = baseDate.toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  }); // YYYY-MM-DD format
  const [year, month, day] = bangkokDateStr.split("-").map(Number);

  // สร้าง Date object สำหรับเวลาไทยที่ต้องการ
  // ใช้ UTC constructor แล้วบวก offset ของเวลาไทย
  const utcTime = Date.UTC(
    year,
    month - 1,
    day,
    hoursThai - 7,
    minutesThai,
    0,
    0
  );
  return new Date(utcTime);
}

// คืนค่าเที่ยงคืนของวันเดียวกับ dateRef ตามเวลาไทย (Bangkok midnight) เป็น Date เซิร์ฟเวอร์
function getBangkokMidnight(dateRef) {
  // แปลง dateRef เป็นวันที่ในเวลาไทย
  const bangkokDateStr = dateRef.toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  }); // YYYY-MM-DD format
  const [year, month, day] = bangkokDateStr.split("-").map(Number);

  // สร้างเที่ยงคืนในเวลาไทย (00:00:00) แล้วแปลงเป็น UTC
  const utcTime = Date.UTC(year, month - 1, day, 0 - 7, 0, 0, 0); // ลบ 7 ชั่วโมงสำหรับ UTC+7
  return new Date(utcTime);
}

const lotteryLaoService = require("../lottery/lottery_lao.service");
const lotteryLaoExtraService = require("../lottery/lottery_lao_extra.service");
const lotteryLaoStarsService = require("../lottery/lottery_lao_stars.service");
const lotteryLaoUnionService = require("../lottery/lottery_lao_union.service");

// Import services สำหรับหวยลาวแต่ละประเภท
const lotteryLaoHdService = require("../lottery/lottery_lao_hd.service");
const lotteryLaoVipService = require("../lottery/lottery_lao_vip.service");
const lotteryLaoStarsVipService = require("../lottery/lottery_lao_stars_vip.service");
const lotteryLaoRedcrossService = require("../lottery/lottery_lao_redcross.service");
const lotteryLaoThakhek5dService = require("../lottery/lottery_lao_thakhek_5d.service");
const lotteryLaoThakhekVipService = require("../lottery/lottery_lao_thakhek_vip.service");
const lotteryLaoTvService = require("../lottery/lottery_lao_tv.service");

// Import services สำหรับหวย 4D
const lotteryMagnum4dService = require("../lottery/lottery_magnum_4d.service");
const lotterySingapore4dService = require("../lottery/lottery_singapore_4d.service");
const lotteryGrandDragon4dService = require("../lottery/lottery_grand_dragon_4d.service");

// Import services สำหรับหวยไทย
const lotteryThaiGsbService = require("../lottery/lottery_thai_gsb.service");
const lotteryThaiSavingsService = require("../lottery/lottery_thai_savings.service");

// Import services สำหรับหวยฮานอย
const lotteryHanoiAseanService = require("../lottery/lottery_hanoi_asean.service");
const lotteryHanoiHdService = require("../lottery/lottery_hanoi_hd.service");
const lotteryHanoiStarService = require("../lottery/lottery_hanoi_star.service");
const lotteryHanoiTvService = require("../lottery/lottery_hanoi_tv.service");
const lotteryHanoiSpecialService = require("../lottery/lottery_hanoi_special.service");
const lotteryHanoiRedcrossService = require("../lottery/lottery_hanoi_redcross.service");
const lotteryHanoiSpecialApiService = require("../lottery/lottery_hanoi_special_api.service");
const lotteryHanoiService = require("../lottery/lottery_hanoi.service");
const lotteryHanoiDevelopService = require("../lottery/lottery_hanoi_develop.service");
const lotteryHanoiVipService = require("../lottery/lottery_hanoi_vip.service");
const lotteryHanoiExtraService = require("../lottery/lottery_hanoi_extra.service");
const lotteryEgyptStockService = require("../lottery/lottery_egypt_stock.service");
const lotteryKoreanStockVipService = require("../lottery/lottery_korean_stock_vip.service");
const lotteryHangsengAfternoonService = require("../lottery/lottery_hangseng_afternoon.service");

// Helper function สำหรับ retry mechanism
const retryWithDelay = async (fn, delaySeconds = 5) => {
  let attempt = 1;

  while (true) {
    try {
      const result = await fn();

      // ตรวจสอบว่าผลหวยออกครบหรือยัง (ไม่มี "xxx", "xx", "xxxx", "xxxxx")
      if (result && result.results) {
        const hasIncompleteResults = Object.values(result.results).some(
          value => {
            if (typeof value === "string") {
              // เช็ค "xxx", "xx", "xxxx", "xxxxx" หรือค่าว่าง
              return (
                value.includes("xxx") ||
                value.includes("xx") ||
                value === "" ||
                value === null ||
                value === undefined
              );
            }
            return value === null || value === undefined;
          }
        );

        if (!hasIncompleteResults) {
          console.log(`✅ ผลหวยออกครบแล้ว หลังจากลอง ${attempt} ครั้ง`);
          return result;
        }

        console.log(
          `⏳ ผลหวยยังไม่ออกครบ (มี "xxx") ลองใหม่ใน ${delaySeconds} วินาที (ครั้งที่ ${attempt})`
        );
        console.log(`📊 ผลปัจจุบัน:`, JSON.stringify(result.results, null, 2));
      }

      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      attempt++;
    } catch (error) {
      console.error(
        `❌ เกิดข้อผิดพลาดในการลองครั้งที่ ${attempt}:`,
        error.message
      );
      console.log(`⏳ ลองใหม่ใน ${delaySeconds} วินาที`);
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      attempt++;
    }
  }
};

// หวยลาวพัฒนา
exports.huaylaocronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoService.fetchAndSaveLaoLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาว Extra
exports.huaylaoextracronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoExtraService.fetchAndSaveLaoExtraLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวสตาร์
exports.huaylaostarcronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoStarsService.fetchAndSaveLaoStarsLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวสามัคคี
exports.huaylaounioncronjob = async function () {
  return await retryWithDelay(
    () => lotteryLaoUnionService.fetchLatestResult(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาว HD
exports.huaylaohd = async function () {
  return await retryWithDelay(
    () => lotteryLaoHdService.fetchAndSaveLaoHdLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาว VIP
exports.huaylaovip = async function () {
  return await retryWithDelay(
    () => lotteryLaoVipService.fetchAndSaveLaoVipLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวสตาร์ VIP
exports.huaylaostarvip = async function () {
  return await retryWithDelay(
    () => lotteryLaoStarsVipService.fetchAndSaveLaoStarsVipLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวกาชาด
exports.huylaogachad = async function () {
  return await retryWithDelay(
    () => lotteryLaoRedcrossService.fetchAndSaveLaoRedcrossLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวทำเนียบ 5D
exports.huaylaothakhek5d = async function () {
  return await retryWithDelay(
    () => lotteryLaoThakhek5dService.fetchAndSaveLaoThakhek5dLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาวทำเนียบ VIP
exports.huaylaothakhekvip = async function () {
  return await retryWithDelay(
    () => lotteryLaoThakhekVipService.fetchAndSaveLaoThakhekVipLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยลาว TV
exports.huaylaotv = async function () {
  return await retryWithDelay(
    () => lotteryLaoTvService.fetchAndSaveLaoTvLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวย Magnum 4D
exports.huaymagnum4d = async function () {
  return await retryWithDelay(
    () => lotteryMagnum4dService.fetchAndSaveMagnum4dLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวย Singapore 4D
exports.huaysingapore4d = async function () {
  return await retryWithDelay(
    () => lotterySingapore4dService.fetchAndSaveSingapore4dLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวย Grand Dragon 4D
exports.huaygranddragon4d = async function () {
  return await retryWithDelay(
    () => lotteryGrandDragon4dService.fetchAndSaveGrandDragon4dLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยออมสิน
exports.huaythaigsb = async function () {
  return await retryWithDelay(
    () => lotteryThaiGsbService.fetchAndSaveThaiGsbLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวย ธกส
exports.huaythaisavings = async function () {
  return await retryWithDelay(
    () => lotteryThaiSavingsService.fetchAndSaveThaiSavingsLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยอาเซียน
exports.huayhanoiasean = async function () {
  return await retryWithDelay(
    () => lotteryHanoiAseanService.fetchAndSaveHanoiAseanLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอย HD
exports.huayhanoihd = async function () {
  return await retryWithDelay(
    () => lotteryHanoiHdService.fetchAndSaveHanoiHdLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยสตาร์
exports.huayhanoistar = async function () {
  return await retryWithDelay(
    () => lotteryHanoiStarService.fetchAndSaveHanoiStarLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอย TV
exports.huayhanoitv = async function () {
  return await retryWithDelay(
    () => lotteryHanoiTvService.fetchAndSaveHanoiTvLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยเฉพาะกิจ
exports.huayhanoispecial = async function () {
  return await retryWithDelay(
    () => lotteryHanoiSpecialService.fetchAndSaveHanoiSpecialLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยกาชาด
exports.huayhanoiredcross = async function () {
  return await retryWithDelay(
    () => lotteryHanoiRedcrossService.fetchAndSaveHanoiRedcrossLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยพิเศษ
exports.huayhanoispecialapi = async function () {
  return await retryWithDelay(
    () => lotteryHanoiSpecialApiService.fetchAndSaveHanoiSpecialApiLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอย
exports.huayhanoi = async function () {
  return await retryWithDelay(
    () => lotteryHanoiService.fetchAndSaveHanoiLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอยพัฒนา
exports.huayhanoidevelop = async function () {
  return await retryWithDelay(
    () => lotteryHanoiDevelopService.fetchAndSaveHanoiDevelopLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอย VIP
exports.huayhanoivip = async function () {
  return await retryWithDelay(
    () => lotteryHanoiVipService.fetchAndSaveHanoiVipLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮานอย EXTRA
exports.huayhanoiextra = async function () {
  return await retryWithDelay(
    () => lotteryHanoiExtraService.fetchAndSaveHanoiExtraLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยหุ้นอิยิปต์
exports.huayegyptstock = async function () {
  return await retryWithDelay(
    () => lotteryEgyptStockService.fetchAndSaveEgyptStockLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยหุ้นเกาหลี VIP
exports.huaykoreanstockvip = async function () {
  return await retryWithDelay(
    () => lotteryKoreanStockVipService.fetchAndSaveKoreanStockVipLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// หวยฮั่งเส็งรอบบ่าย
exports.huayhangsengafternoon = async function () {
  return await retryWithDelay(
    () =>
      lotteryHangsengAfternoonService.fetchAndSaveHangsengAfternoonLottery(),
    60 // รอ 1 นาทีระหว่างการลอง
  );
};

// Wrapper ฟังก์ชันสำหรับ cronjob พร้อม logging
const createCronjobWithLogging = async (
  jobName,
  lotteryName,
  createFunction
) => {
  const startTime = Date.now();
  try {
    const result = await createFunction();
    await logCronjobExecution(
      jobName,
      lotteryName,
      "success",
      result,
      null,
      startTime
    );
    return result;
  } catch (error) {
    await logCronjobExecution(
      jobName,
      lotteryName,
      "error",
      null,
      error,
      startTime
    );
    throw error;
  }
};

//สร้าง lotteryset หวยรัฐบาล
exports.createThaiGovernmentLottery = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🏛️ เริ่มสร้างหวยรัฐบาล...");

    // หา lottery_type_id สำหรับหวยรัฐบาล
    const lotteryType = await LotteryType.findOne({ lottery_type: "หวยไทย" });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยไทยในระบบ");
    }

    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let drawDate, resultTime;

    // ถ้าสร้างวันที่ 2 = ออกผลวันที่ 16 ของเดือนเดียวกัน
    if (currentDate === 2) {
      // ออกผลวันที่ 16 ของเดือนเดียวกัน เวลา 16:30
      drawDate = new Date(currentYear, currentMonth, 16);
      resultTime = getBangkokDateAt(16, 30, drawDate);
    }
    // ถ้าสร้างวันที่ 17 = ออกผลวันที่ 1 ของเดือนถัดไป
    else if (currentDate === 17) {
      // ออกผลวันที่ 1 ของเดือนถัดไป เวลา 16:30
      drawDate = new Date(currentYear, currentMonth + 1, 1);
      resultTime = getBangkokDateAt(16, 30, drawDate);
    }
    // ถ้าไม่ใช่วันที่ 2 หรือ 17 ให้สร้างงวดถัดไป
    else {
      // หาว่างวดถัดไปคือวันไหน
      if (currentDate < 2) {
        // ยังไม่ถึงวันที่ 2 ของเดือนนี้ -> สร้างงวดวันที่ 16 ของเดือนนี้
        drawDate = new Date(currentYear, currentMonth, 16);
      } else if (currentDate < 17) {
        // อยู่ระหว่างวันที่ 2-16 -> สร้างงวดวันที่ 1 ของเดือนถัดไป
        drawDate = new Date(currentYear, currentMonth + 1, 1);
      } else {
        // หลังวันที่ 17 แล้ว -> สร้างงวดวันที่ 16 ของเดือนถัดไป
        drawDate = new Date(currentYear, currentMonth + 1, 16);
      }
      resultTime = getBangkokDateAt(16, 30, drawDate);
      console.log(
        `📅 สร้างงวดถัดไป: ${drawDate.getDate()}/${
          drawDate.getMonth() + 1
        }/${drawDate.getFullYear()}`
      );
    }

    // สร้างชื่องวด
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const drawMonth = drawDate.getMonth();
    const drawYear = drawDate.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const roundNumber = drawDate.getDate() === 1 ? 1 : 2;

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: "หวยรัฐบาล",
      openTime: now, // เริ่มแทงได้ทันที (เวลาเซิร์ฟเวอร์)
      closeTime: new Date(resultTime.getTime() - 30 * 60 * 1000), // หยุดแทง 30 นาทีก่อนออกผล
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: "หวยรัฐบาล",
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ หวยรัฐบาลงวดวันที่ ${drawDate.getDate()} ${
          monthNames[drawMonth]
        } ${drawYear} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้างหวยรัฐบาลสำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 วันออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวยรัฐบาล:", error.message);
    throw error;
  }
};

//สร้าง lotteryset หวยออมสิน
exports.createThaiSavingsLottery = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🏦 เริ่มสร้างหวยออมสิน...");

    // หา lottery_type_id สำหรับหวยออมสิน
    const lotteryType = await LotteryType.findOne({ lottery_type: "หวยไทย" });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยไทยในระบบ");
    }

    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let drawDate, resultTime;

    // ถ้าสร้างวันที่ 2 = ออกผลวันที่ 16 ของเดือนเดียวกัน
    if (currentDate === 2) {
      // ออกผลวันที่ 16 ของเดือนเดียวกัน เวลา 16:30
      drawDate = new Date(currentYear, currentMonth, 16);
      resultTime = getBangkokDateAt(16, 30, drawDate);
    }
    // ถ้าสร้างวันที่ 17 = ออกผลวันที่ 1 ของเดือนถัดไป
    else if (currentDate === 17) {
      // ออกผลวันที่ 1 ของเดือนถัดไป เวลา 16:30
      drawDate = new Date(currentYear, currentMonth + 1, 1);
      resultTime = getBangkokDateAt(16, 30, drawDate);
    }
    // ถ้าไม่ใช่วันที่ 2 หรือ 17 ให้สร้างงวดถัดไป
    else {
      // หาว่างวดถัดไปคือวันไหน
      if (currentDate < 2) {
        // ยังไม่ถึงวันที่ 2 ของเดือนนี้ -> สร้างงวดวันที่ 16 ของเดือนนี้
        drawDate = new Date(currentYear, currentMonth, 16);
      } else if (currentDate < 17) {
        // อยู่ระหว่างวันที่ 2-16 -> สร้างงวดวันที่ 1 ของเดือนถัดไป
        drawDate = new Date(currentYear, currentMonth + 1, 1);
      } else {
        // หลังวันที่ 17 แล้ว -> สร้างงวดวันที่ 16 ของเดือนถัดไป
        drawDate = new Date(currentYear, currentMonth + 1, 16);
      }
      resultTime = getBangkokDateAt(16, 30, drawDate);
      console.log(
        `📅 สร้างงวดถัดไป: ${drawDate.getDate()}/${
          drawDate.getMonth() + 1
        }/${drawDate.getFullYear()}`
      );
    }

    // สร้างชื่องวด
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const drawMonth = drawDate.getMonth();
    const drawYear = drawDate.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const roundNumber = drawDate.getDate() === 1 ? 1 : 2;

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: "หวยออมสิน",
      openTime: now, // เริ่มแทงได้ทันที (เวลาเซิร์ฟเวอร์)
      closeTime: new Date(resultTime.getTime() - 30 * 60 * 1000), // หยุดแทง 30 นาทีก่อนออกผล
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: "หวยออมสิน",
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ หวยออมสินงวดวันที่ ${drawDate.getDate()} ${
          monthNames[drawMonth]
        } ${drawYear} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้างหวยออมสินสำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 วันออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวยออมสิน:", error.message);
    throw error;
  }
};

//สร้าง lotteryset หวย ธกส
exports.createThaiGsbLottery = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🏛️ เริ่มสร้างหวย ธกส...");

    // หา lottery_type_id สำหรับหวย ธกส
    const lotteryType = await LotteryType.findOne({ lottery_type: "หวยไทย" });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยไทยในระบบ");
    }

    const now = new Date();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let drawDate, resultTime;

    // ถ้าสร้างวันที่ 17 = ออกผลวันที่ 16 ของเดือนถัดไป
    if (currentDate === 17) {
      // ออกผลวันที่ 16 ของเดือนถัดไป เวลา 16:30
      drawDate = new Date(currentYear, currentMonth + 1, 16);
      resultTime = getBangkokDateAt(16, 30, drawDate);
    }
    // ถ้าไม่ใช่วันที่ 17 ให้สร้างงวดถัดไป
    else {
      // หาว่างวดถัดไปคือวันไหน
      if (currentDate < 17) {
        // ยังไม่ถึงวันที่ 17 -> สร้างงวดวันที่ 16 ของเดือนถัดไป
        drawDate = new Date(currentYear, currentMonth + 1, 16);
      } else {
        // หลังวันที่ 17 แล้ว -> สร้างงวดวันที่ 16 ของเดือนถัดไปอีก
        drawDate = new Date(currentYear, currentMonth + 2, 16);
      }
      resultTime = getBangkokDateAt(16, 30, drawDate);
      console.log(
        `📅 สร้างงวดถัดไป: ${drawDate.getDate()}/${
          drawDate.getMonth() + 1
        }/${drawDate.getFullYear()}`
      );
    }

    // สร้างชื่องวด
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const drawMonth = drawDate.getMonth();
    const drawYear = drawDate.getFullYear() + 543; // แปลงเป็น พ.ศ.

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: "หวย ธกส",
      openTime: now, // เริ่มแทงได้ทันที (เวลาเซิร์ฟเวอร์)
      closeTime: new Date(resultTime.getTime() - 30 * 60 * 1000), // หยุดแทง 30 นาทีก่อนออกผล
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: "หวย ธกส",
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ หวย ธกส งวดวันที่ ${drawDate.getDate()} ${
          monthNames[drawMonth]
        } ${drawYear} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้างหวย ธกส สำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 วันออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวย ธกส:", error.message);
    throw error;
  }
};

// ฟังก์ชันทั่วไปสำหรับสร้างหวยลาว
const createLaoLottery = async (lotteryName, drawTime) => {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log(`🇱🇦 เริ่มสร้าง${lotteryName}...`);

    // หา lottery_type_id สำหรับหวยลาว
    const lotteryType = await LotteryType.findOne({ lottery_type: "หวยลาว" });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยลาวในระบบ");
    }

    const now = new Date();
    const [hours, minutes] = drawTime.split(":").map(Number);

    // เวลาผลออกตามเอกสารเป็นเวลาไทย -> แปลงเป็นเวลาบนเซิร์ฟเวอร์
    let resultTime = getBangkokDateAt(hours, minutes, now);

    // ถ้าเวลาผ่านไปแล้ว (เทียบตามเวลาเซิร์ฟเวอร์) ให้เลื่อนไปวันถัดไปของไทย
    if (resultTime <= now) {
      const nextDayThai = new Date(resultTime.getTime() + 24 * 60 * 60 * 1000);
      resultTime = getBangkokDateAt(hours, minutes, nextDayThai);
    }

    // คำนวณเวลาปิดรับแทง (1 นาทีก่อนออกผล)
    const closeTime = new Date(resultTime.getTime() - 1 * 60 * 1000);

    // ถ้าเวลาปิดน้อยกว่าหรือเท่ากับเวลาปัจจุบัน ให้ใช้เวลาปัจจุบันบวก 1 นาที
    const finalCloseTime =
      closeTime <= now ? new Date(now.getTime() + 60 * 1000) : closeTime;

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: lotteryName,
      openTime: now, // เริ่มแทงได้ทันที
      closeTime: finalCloseTime, // หยุดแทงก่อนออกผล (อย่างน้อย 1 นาทีหลังจากเปิด)
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: lotteryName,
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ ${lotteryName} งวดเวลา ${resultTime.toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้าง${lotteryName}สำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 วันออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการสร้าง${lotteryName}:`, error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับสร้างหวยลาว HD
exports.createLaoHdLottery = async function () {
  return await createLaoLottery("หวยลาว HD", "13:45");
};

// ฟังก์ชันสำหรับสร้างหวยลาวสตาร์
exports.createLaoStarsLottery = async function () {
  return await createLaoLottery("หวยลาวสตาร์", "15:45");
};

// ฟังก์ชันสำหรับสร้างหวยลาวท่าแขก VIP
exports.createLaoThakhekVipLottery = async function () {
  return await createLaoLottery("หวยลาวท่าแขก VIP", "20:00");
};

// ฟังก์ชันสำหรับสร้างหวยลาวท่าแขก 5D
exports.createLaoThakhek5dLottery = async function () {
  return await createLaoLottery("หวยลาวท่าแขก 5D", "21:45");
};

// ฟังก์ชันสำหรับสร้างหวยลาวสามัคคี
exports.createLaoUnionLottery = async function () {
  return await createLaoLottery("หวยลาวสามัคคี", "20:40");
};

// ฟังก์ชันสำหรับสร้างหวยลาว VIP
exports.createLaoVipLottery = async function () {
  return await createLaoLottery("หวยลาว VIP", "21:30");
};

// ฟังก์ชันสำหรับสร้างหวยลาวสตาร์ VIP
exports.createLaoStarsVipLottery = async function () {
  return await createLaoLottery("หวยลาวสตาร์ VIP", "22:05");
};

// ฟังก์ชันสำหรับสร้างหวยลาวกาชาด
exports.createLaoRedcrossLottery = async function () {
  return await createLaoLottery("หวยลาวกาชาด", "23:30");
};

// ฟังก์ชันสำหรับสร้างหวยลาวพัฒนา
exports.createLaoDevelopLottery = async function () {
  return await createLaoLottery("หวยลาวพัฒนา", "20:30");
};

// ฟังก์ชันสำหรับสร้างหวยลาว Extra
exports.createLaoExtraLottery = async function () {
  return await createLaoLottery("หวยลาว Extra", "08:30");
};

// ฟังก์ชันสำหรับสร้างหวยลาว TV
exports.createLaoTvLottery = async function () {
  return await createLaoLottery("หวยลาว TV", "10:30");
};

// ============= ฟังก์ชันสำหรับหวย 4D =============

// ฟังก์ชันทั่วไปสำหรับสร้างหวย 4D
const create4dLottery = async (
  lotteryName,
  drawTime,
  lotteryTypeStr = "หวย 4D"
) => {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log(`🎲 เริ่มสร้าง${lotteryName}...`);

    // หา lottery_type_id สำหรับหวย 4D
    const lotteryType = await LotteryType.findOne({
      lottery_type: lotteryTypeStr,
    });
    if (!lotteryType) {
      throw new Error(`ไม่พบประเภท${lotteryTypeStr}ในระบบ`);
    }

    const now = new Date();
    const [hours, minutes] = drawTime.split(":").map(Number);

    // เวลาผลออกเป็นเวลาไทย -> แปลงเป็นเวลาบนเซิร์ฟเวอร์
    let resultTime = getBangkokDateAt(hours, minutes, now);
    if (resultTime <= now) {
      const nextDayThai = new Date(resultTime.getTime() + 24 * 60 * 60 * 1000);
      resultTime = getBangkokDateAt(hours, minutes, nextDayThai);
    }

    // กำหนดเวลาเปิดแทงเป็นเที่ยงคืนของวันเดียวกับ resultTime (เวลาไทย)
    const openTime = getBangkokMidnight(resultTime);

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: lotteryName,
      openTime: openTime, // เปิดแทงเที่ยงคืน
      closeTime: new Date(resultTime.getTime() - 10 * 60 * 1000), // หยุดแทง 10 นาทีก่อนออกผล
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: lotteryName,
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ ${lotteryName} งวดเวลา ${resultTime.toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้าง${lotteryName}สำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 เปิดแทง: ${openTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );
    console.log(
      `📅 วันออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการสร้าง${lotteryName}:`, error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับสร้างหวย Magnum 4D
exports.createMagnum4dLottery = async function () {
  return await create4dLottery("หวย Magnum 4D", "18:00");
};

// ฟังก์ชันสำหรับสร้างหวย Singapore 4D
exports.createSingapore4dLottery = async function () {
  return await create4dLottery("หวย Singapore 4D", "17:30");
};

// ฟังก์ชันสำหรับสร้างหวย Grand Dragon 4D
exports.createGrandDragon4dLottery = async function () {
  return await create4dLottery("หวย Grand Dragon 4D", "18:10");
};

// ============= ฟังก์ชันสำหรับหวยฮานอย =============

// ฟังก์ชันทั่วไปสำหรับสร้างหวยฮานอย
const createHanoiLottery = async (
  lotteryName,
  drawTime,
  lotteryTypeStr = "หวยฮานอย"
) => {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log(`🇻🇳 เริ่มสร้าง${lotteryName}...`);

    // หา lottery_type_id สำหรับหวยฮานอย
    const lotteryType = await LotteryType.findOne({
      lottery_type: lotteryTypeStr,
    });
    if (!lotteryType) {
      throw new Error(`ไม่พบประเภท${lotteryTypeStr}ในระบบ`);
    }

    const now = new Date();
    const [hours, minutes] = drawTime.split(":").map(Number);

    // เวลาผลออกเป็นเวลาไทย -> แปลงเป็นเวลาบนเซิร์ฟเวอร์
    let resultTime = getBangkokDateAt(hours, minutes, now);
    if (resultTime <= now) {
      const nextDayThai = new Date(resultTime.getTime() + 24 * 60 * 60 * 1000);
      resultTime = getBangkokDateAt(hours, minutes, nextDayThai);
    }

    // กำหนดเวลาเปิดแทงเป็นเที่ยงคืนของวันเดียวกับ resultTime (เวลาไทย)
    const openTime = getBangkokMidnight(resultTime);

    const lotteryData = {
      lottery_type_id: lotteryType._id,
      name: lotteryName,
      openTime: openTime, // เปิดแทงเที่ยงคืน
      closeTime: resultTime, // ปิดแทงตรงเวลาออกผล
      result_time: resultTime,
      status: "scheduled",
    };

    // ตรวจสอบว่ามีงวดนี้แล้วหรือยัง
    const LotterySets = require("../../models/lotterySets.model");
    const existingSet = await LotterySets.findOne({
      name: lotteryName,
      result_time: resultTime,
    });

    if (existingSet) {
      console.log(
        `⚠️ ${lotteryName} งวดเวลา ${resultTime.toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })} มีอยู่แล้ว`
      );
      return existingSet;
    }

    const createdLottery = await createLotterySets(lotteryData);

    console.log(`✅ สร้าง${lotteryName}สำเร็จ: ${createdLottery.id}`);
    console.log(
      `📅 เปิดแทง: ${openTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );
    console.log(
      `📅 ปิดแทง/ออกผล: ${resultTime.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}`
    );

    return createdLottery;
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการสร้าง${lotteryName}:`, error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับสร้างฮานอยอาเซียน
exports.createHanoiAseanLottery = async function () {
  return await createHanoiLottery("หวยฮานอยอาเซียน", "09:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอย HD
exports.createHanoiHdLottery = async function () {
  return await createHanoiLottery("หวยฮานอย HD", "11:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอยสตาร์
exports.createHanoiStarLottery = async function () {
  return await createHanoiLottery("หวยฮานอยสตาร์", "12:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอย TV
exports.createHanoiTvLottery = async function () {
  return await createHanoiLottery("หวยฮานอย TV", "14:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอยเฉพาะกิจ
exports.createHanoiSpecialLottery = async function () {
  return await createHanoiLottery("หวยฮานอยเฉพาะกิจ", "16:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอยกาชาด
exports.createHanoiRedcrossLottery = async function () {
  return await createHanoiLottery("หวยฮานอยกาชาด", "16:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอยพิเศษ
exports.createHanoiSpecialApiLottery = async function () {
  return await createHanoiLottery("หวยฮานอยพิเศษ", "17:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอย
exports.createHanoiLottery = async function () {
  return await createHanoiLottery("หวยฮานอย", "18:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอยพัฒนา
exports.createHanoiDevelopLottery = async function () {
  return await createHanoiLottery("หวยฮานอยพัฒนา", "19:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอย VIP
exports.createHanoiVipLottery = async function () {
  return await createHanoiLottery("หวยฮานอย VIP", "19:30");
};

// ฟังก์ชันสำหรับสร้างหวยฮานอย EXTRA
exports.createHanoiExtraLottery = async function () {
  return await createHanoiLottery("หวยฮานอย EXTRA", "22:15");
};

// ============= WRAPPER FUNCTIONS สำหรับ CRONJOBS พร้อม LOGGING =============

// หวยไทย
exports.createThaiGovernmentLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createThaiGovernmentLottery",
    "หวยรัฐบาล",
    exports.createThaiGovernmentLottery
  );
};

exports.createThaiSavingsLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createThaiSavingsLottery",
    "หวยออมสิน",
    exports.createThaiSavingsLottery
  );
};

exports.createThaiGsbLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createThaiGsbLottery",
    "หวย ธกส",
    exports.createThaiGsbLottery
  );
};

// หวยลาว
exports.createLaoHdLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoHdLottery",
    "หวยลาว HD",
    exports.createLaoHdLottery
  );
};

exports.createLaoStarsLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoStarsLottery",
    "หวยลาวสตาร์",
    exports.createLaoStarsLottery
  );
};

exports.createLaoThakhekVipLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoThakhekVipLottery",
    "หวยลาวท่าแขก VIP",
    exports.createLaoThakhekVipLottery
  );
};

exports.createLaoThakhek5dLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoThakhek5dLottery",
    "หวยลาวท่าแขก 5D",
    exports.createLaoThakhek5dLottery
  );
};

exports.createLaoUnionLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoUnionLottery",
    "หวยลาวสามัคคี",
    exports.createLaoUnionLottery
  );
};

exports.createLaoVipLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoVipLottery",
    "หวยลาว VIP",
    exports.createLaoVipLottery
  );
};

exports.createLaoStarsVipLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoStarsVipLottery",
    "หวยลาวสตาร์ VIP",
    exports.createLaoStarsVipLottery
  );
};

exports.createLaoRedcrossLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoRedcrossLottery",
    "หวยลาวกาชาด",
    exports.createLaoRedcrossLottery
  );
};

exports.createLaoDevelopLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoDevelopLottery",
    "หวยลาวพัฒนา",
    exports.createLaoDevelopLottery
  );
};

exports.createLaoExtraLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoExtraLottery",
    "หวยลาว Extra",
    exports.createLaoExtraLottery
  );
};

exports.createLaoTvLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createLaoTvLottery",
    "หวยลาว TV",
    exports.createLaoTvLottery
  );
};

// หวย 4D
exports.createMagnum4dLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createMagnum4dLottery",
    "หวย Magnum 4D",
    exports.createMagnum4dLottery
  );
};

exports.createSingapore4dLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createSingapore4dLottery",
    "หวย Singapore 4D",
    exports.createSingapore4dLottery
  );
};

exports.createGrandDragon4dLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createGrandDragon4dLottery",
    "หวย Grand Dragon 4D",
    exports.createGrandDragon4dLottery
  );
};

// หวยฮานอย
exports.createHanoiAseanLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiAseanLottery",
    "หวยฮานอยอาเซียน",
    exports.createHanoiAseanLottery
  );
};

exports.createHanoiHdLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiHdLottery",
    "หวยฮานอย HD",
    exports.createHanoiHdLottery
  );
};

exports.createHanoiStarLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiStarLottery",
    "หวยฮานอยสตาร์",
    exports.createHanoiStarLottery
  );
};

exports.createHanoiTvLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiTvLottery",
    "หวยฮานอย TV",
    exports.createHanoiTvLottery
  );
};

exports.createHanoiSpecialLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiSpecialLottery",
    "หวยฮานอยเฉพาะกิจ",
    exports.createHanoiSpecialLottery
  );
};

exports.createHanoiRedcrossLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiRedcrossLottery",
    "หวยฮานอยกาชาด",
    exports.createHanoiRedcrossLottery
  );
};

exports.createHanoiSpecialApiLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiSpecialApiLottery",
    "หวยฮานอยพิเศษ",
    exports.createHanoiSpecialApiLottery
  );
};

exports.createHanoiLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiLottery",
    "หวยฮานอย",
    exports.createHanoiLottery
  );
};

exports.createHanoiDevelopLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiDevelopLottery",
    "หวยฮานอยพัฒนา",
    exports.createHanoiDevelopLottery
  );
};

exports.createHanoiVipLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiVipLottery",
    "หวยฮานอย VIP",
    exports.createHanoiVipLottery
  );
};

exports.createHanoiExtraLotteryWithLog = async function () {
  return await createCronjobWithLogging(
    "createHanoiExtraLottery",
    "หวยฮานอย EXTRA",
    exports.createHanoiExtraLottery
  );
};

// ============= หวยยี้กี้ FUNCTIONS =============

// สร้างหวยยี้กี้ธรรม 96 รอบ (ทุก 15 นาที)
exports.createYiKeeRounds = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🎲 เริ่มสร้างหวยยี้กี้ธรรม 96 รอบ...");

    // หา lottery_type_id สำหรับหวยยี้กี้
    const lotteryType = await LotteryType.findOne({ lottery_type: "หวยยี่กี" });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยยี่กี้ในระบบ");
    }

    const now = new Date();
    const midnight = getBangkokMidnight(now);
    const createdLotteries = [];

    // สร้าง 96 รอบ (ทุก 15 นาที)
    for (let i = 0; i < 96; i++) {
      const roundNumber = i + 1;
      const minutesOffset = i * 15;

      // เวลาเปิดรับแทง (เที่ยงคืน + offset)
      const openTime = new Date(midnight.getTime() + minutesOffset * 60 * 1000);

      // เวลาปิดรับแทง (ก่อนออกผล 1 นาที)
      const closeTime = new Date(openTime.getTime() + (15 - 1) * 60 * 1000);

      // เวลาออกผล (15 นาทีหลังเปิด)
      const resultTime = new Date(openTime.getTime() + 15 * 60 * 1000);

      const lotteryData = {
        lottery_type_id: lotteryType._id,
        name: `หวยยี่กี`,
        openTime: openTime,
        closeTime: closeTime,
        result_time: resultTime,
        status: "scheduled",
      };

      // ตรวจสอบว่ามีรอบนี้แล้วหรือยัง
      const LotterySets = require("../../models/lotterySets.model");
      const existingSet = await LotterySets.findOne({
        name: lotteryData.name,
        result_time: resultTime,
      });

      if (!existingSet) {
        const createdLottery = await createLotterySets(lotteryData);
        createdLotteries.push(createdLottery);
      }
    }

    console.log(`✅ สร้างหวยยี้กี้ธรรมสำเร็จ ${createdLotteries.length} รอบ`);
    return { count: createdLotteries.length, lotteries: createdLotteries };
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ธรรม:", error.message);
    throw error;
  }
};

// สร้างหวยยี้กี้ 4G 144 รอบ (ทุก 10 นาที)
exports.createYiKee4GRounds = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🎲 เริ่มสร้างหวยยี้กี้ 4G 144 รอบ...");

    // หา lottery_type_id สำหรับหวยยี้กี้ 4G
    const lotteryType = await LotteryType.findOne({
      lottery_type: "หวยยี่กี",
    });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยยี้กี้ 4G ในระบบ");
    }

    const now = new Date();
    const midnight = getBangkokMidnight(now);
    const createdLotteries = [];

    // สร้าง 144 รอบ (ทุก 10 นาที)
    for (let i = 0; i < 144; i++) {
      const roundNumber = i + 1;
      const minutesOffset = i * 10;

      // เวลาเปิดรับแทง (เที่ยงคืน + offset)
      const openTime = new Date(midnight.getTime() + minutesOffset * 60 * 1000);

      // เวลาปิดรับแทง (ก่อนออกผล 1 นาที)
      const closeTime = new Date(openTime.getTime() + (10 - 1) * 60 * 1000);

      // เวลาออกผล (10 นาทีหลังเปิด)
      const resultTime = new Date(openTime.getTime() + 10 * 60 * 1000);

      const lotteryData = {
        lottery_type_id: lotteryType._id,
        name: `หวยยี่กี 4G`,
        openTime: openTime,
        closeTime: closeTime,
        result_time: resultTime,
        status: "scheduled",
      };

      // ตรวจสอบว่ามีรอบนี้แล้วหรือยัง
      const LotterySets = require("../../models/lotterySets.model");
      const existingSet = await LotterySets.findOne({
        name: lotteryData.name,
        result_time: resultTime,
      });

      if (!existingSet) {
        const createdLottery = await createLotterySets(lotteryData);
        createdLotteries.push(createdLottery);
      }
    }

    console.log(`✅ สร้างหวยยี้กี้ 4G สำเร็จ ${createdLotteries.length} รอบ`);
    return { count: createdLotteries.length, lotteries: createdLotteries };
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ 4G:", error.message);
    throw error;
  }
};

// สร้างหวยยี้กี้ 5G 288 รอบ (ทุก 5 นาที)
exports.createYiKee5GRounds = async function () {
  try {
    const { createLotterySets } = require("../lottery/lotterySets.service");
    const LotteryType = require("../../models/lotteryType.model");

    console.log("🎲 เริ่มสร้างหวยยี้กี้ 5G 288 รอบ...");

    // หา lottery_type_id สำหรับหวยยี้กี้ 5G
    const lotteryType = await LotteryType.findOne({
      lottery_type: "หวยยี่กี",
    });
    if (!lotteryType) {
      throw new Error("ไม่พบประเภทหวยยี้กี้ 5G ในระบบ");
    }

    const now = new Date();
    const midnight = getBangkokMidnight(now);
    const createdLotteries = [];

    // สร้าง 288 รอบ (ทุก 5 นาที)
    for (let i = 0; i < 288; i++) {
      const roundNumber = i + 1;
      const minutesOffset = i * 5;

      // เวลาเปิดรับแทง (เที่ยงคืน + offset)
      const openTime = new Date(midnight.getTime() + minutesOffset * 60 * 1000);

      // เวลาปิดรับแทง (ก่อนออกผล 1 นาที)
      const closeTime = new Date(openTime.getTime() + (5 - 1) * 60 * 1000);

      // เวลาออกผล (5 นาทีหลังเปิด)
      const resultTime = new Date(openTime.getTime() + 5 * 60 * 1000);

      const lotteryData = {
        lottery_type_id: lotteryType._id,
        name: `หวยยี่กี 5G`,
        openTime: openTime,
        closeTime: closeTime,
        result_time: resultTime,
        status: "scheduled",
      };

      // ตรวจสอบว่ามีรอบนี้แล้วหรือยัง
      const LotterySets = require("../../models/lotterySets.model");
      const existingSet = await LotterySets.findOne({
        name: lotteryData.name,
        result_time: resultTime,
      });

      if (!existingSet) {
        const createdLottery = await createLotterySets(lotteryData);
        createdLotteries.push(createdLottery);
      }
    }

    console.log(`✅ สร้างหวยยี้กี้ 5G สำเร็จ ${createdLotteries.length} รอบ`);
    return { count: createdLotteries.length, lotteries: createdLotteries };
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ 5G:", error.message);
    throw error;
  }
};

// Wrapper functions with logging
exports.createYiKeeRoundsWithLog = async function () {
  return await createCronjobWithLogging(
    "createYiKeeRounds",
    "หวยยี้กี้ธรรม 96 รอบ",
    exports.createYiKeeRounds
  );
};

exports.createYiKee4GRoundsWithLog = async function () {
  return await createCronjobWithLogging(
    "createYiKee4GRounds",
    "หวยยี้กี้ 4G 144 รอบ",
    exports.createYiKee4GRounds
  );
};

exports.createYiKee5GRoundsWithLog = async function () {
  return await createCronjobWithLogging(
    "createYiKee5GRounds",
    "หวยยี้กี้ 5G 288 รอบ",
    exports.createYiKee5GRounds
  );
};
