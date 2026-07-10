const cron = require("node-cron");
const {
  checkLotterySetResults,
} = require("../service/lottery/lotterySets.service");

// ========== CRONJOBS พร้อม LOGGING ==========
// ⚠️ หมายเหตุ: ฟังก์ชันทั้งหมดใช้ WithLog เพื่อบันทึก log ลงตาราง cronjob_logs
// 📄 ฟังก์ชันเดิม (ไม่มี log): ดูไฟล์ cronjob_set.backup.js
// 💾 ตาราง logs: models/cronjob.log.model.js

// ตรวจเช็คการเปิด-ปิดหวยตามช่วงเวลา ทุกนาที
cron.schedule(
  "* * * * *",
  async () => {
    // console.log(`[${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}] ตรวจสอบเปิด-ปิดหวย...`);
    await checkLotterySetResults();
  },
  { timezone: "Asia/Bangkok" }
);

// สร้างหวย รัฐบาล
// สร้างหวยรัฐบาลวันที่ 1 และ 16 ของทุกเดือน เวลา 00:01 น.
cron.schedule(
  "1 0 1,16 * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🏛️ สร้างหวยรัฐบาล...`
    );
    try {
      const {
        createThaiGovernmentLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createThaiGovernmentLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยรัฐบาลสำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยรัฐบาล:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// สร้างหวยออมสิน
// สร้างหวยออมสินวันที่ 1 และ 16 ของทุกเดือน เวลา 00:02 น.
cron.schedule(
  "2 0 1,16 * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🏦 สร้างหวยออมสิน...`
    );
    try {
      const {
        createThaiSavingsLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createThaiSavingsLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยออมสินสำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยออมสิน:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// สร้างหวย ธกส
// สร้างหวย ธกส วันที่ 16 ของทุกเดือน (ยกเว้นมกราคมเป็นวันที่ 17) เวลา 00:03 น.
// หวย ธกส - เดือนกุมภาพันธ์ถึงธันวาคม (วันที่ 16)
cron.schedule(
  "3 0 16 2-12 *",
  async () => {
    const now = new Date();

    console.log(
      `[${now.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🏛️ สร้างหวย ธกส...`
    );
    try {
      const {
        createThaiGsbLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createThaiGsbLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวย ธกส สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย ธกส:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวย ธกส - เดือนมกราคม (วันที่ 17)
cron.schedule(
  "3 0 17 1 *",
  async () => {
    const now = new Date();

    console.log(
      `[${now.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🏛️ สร้างหวย ธกส...`
    );
    try {
      const {
        createThaiGsbLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createThaiGsbLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวย ธกส สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย ธกส:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// ============= หวยลาว CRONJOBS ตามตารางเวลา =============

// หวยลาว HD - สร้างเวลา 13:20 ออกผล 13:45 ทุกวัน
cron.schedule(
  "20 13 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาว HD...`
    );
    try {
      const {
        createLaoHdLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoHdLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาว HD สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว HD:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวสตาร์ - สร้างเวลา 15:00 ออกผล 15:45 ทุกวัน
cron.schedule(
  "0 15 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวสตาร์...`
    );
    try {
      const {
        createLaoStarsLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoStarsLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวสตาร์ สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสตาร์:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวท่าแขก VIP - สร้างเวลา 19:30 ออกผล 20:00 ทุกวัน
cron.schedule(
  "30 19 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวท่าแขก VIP...`
    );
    try {
      const {
        createLaoThakhekVipLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoThakhekVipLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวท่าแขก VIP สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวท่าแขก VIP:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวท่าแขก 5D - สร้างเวลา 20:55 ออกผล 21:45 ทุกวัน
cron.schedule(
  "55 20 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวท่าแขก 5D...`
    );
    try {
      const {
        createLaoThakhek5dLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoThakhek5dLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวท่าแขก 5D สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวท่าแขก 5D:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวสามัคคี - สร้างเวลา 19:50 ออกผล 20:40 ทุกวัน
cron.schedule(
  "50 19 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวสามัคคี...`
    );
    try {
      const {
        createLaoUnionLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoUnionLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวสามัคคี สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสามัคคี:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาว VIP - สร้างเวลา 21:00 ออกผล 21:30 ทุกวัน
cron.schedule(
  "0 21 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาว VIP...`
    );
    try {
      const {
        createLaoVipLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoVipLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาว VIP สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว VIP:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวสตาร์ VIP - สร้างเวลา 21:40 ออกผล 22:05 ทุกวัน
cron.schedule(
  "40 21 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวสตาร์ VIP...`
    );
    try {
      const {
        createLaoStarsVipLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoStarsVipLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวสตาร์ VIP สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวสตาร์ VIP:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวกาชาด - สร้างเวลา 23:00 ทุกวัน  // crojobs ผ่าน
cron.schedule(
  "0 23 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวกาชาด...`
    );
    try {
      const {
        createLaoRedcrossLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoRedcrossLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวกาชาด สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวกาชาด:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาวพัฒนา - สร้างเวลา 20:20 ทุกวัน (วันจันทร์ พุธ ศุกร์) // crojobs ผ่าน
cron.schedule(
  "20 20 * * 1,3,5",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาวพัฒนา...`
    );
    try {
      const {
        createLaoDevelopLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoDevelopLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาวพัฒนา สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาวพัฒนา:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาว Extra - สร้างเวลา 08:25 ทุกวัน   // crojobs ผ่าน
cron.schedule(
  "25 8 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาว Extra...`
    );
    try {
      const {
        createLaoExtraLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoExtraLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาว Extra สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว Extra:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยลาว TV - สร้างเวลา 10:20 ทุกวัน  // มี ซ้ำรอบเช็ค พนนี้
cron.schedule(
  "20 10 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇱🇦 สร้างหวยลาว TV...`
    );
    try {
      const {
        createLaoTvLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createLaoTvLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยลาว TV สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยลาว TV:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// ============= หวย 4D CRONJOBS เปิดเที่ยงคืน =============

// หวย Magnum 4D - สร้างเที่ยงคืนทุกวัน  // error ไม่พบประเภทหวย4Dในระบบ
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวย Magnum 4D...`
    );
    try {
      const {
        createMagnum4dLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createMagnum4dLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวย Magnum 4D สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Magnum 4D:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวย Singapore 4D - สร้างเที่ยงคืนทุกวัน // error ไม่พบประเภทหวย4Dในระบบ
cron.schedule(
  "1 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวย Singapore 4D...`
    );
    try {
      const {
        createSingapore4dLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createSingapore4dLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวย Singapore 4D สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Singapore 4D:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวย Grand Dragon 4D - สร้างเที่ยงคืนทุกวัน  // error ไม่พบประเภทหวย4Dในระบบ
cron.schedule(
  "2 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวย Grand Dragon 4D...`
    );
    try {
      const {
        createGrandDragon4dLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createGrandDragon4dLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวย Grand Dragon 4D สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวย Grand Dragon 4D:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// ============= หวยฮานอย CRONJOBS เปิดเที่ยงคืน =============

// ฮานอยอาเซียน - สร้างเที่ยงคืนทุกวัน  //crojobs ผ่าน
cron.schedule(
  "3 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างฮานอยอาเซียน...`
    );
    try {
      const {
        createHanoiAseanLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiAseanLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างฮานอยอาเซียน สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างฮานอยอาเซียน:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอย HD - สร้างเที่ยงคืนทุกวัน // crojobs ผ่าน
cron.schedule(
  "4 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอย HD...`
    );
    try {
      const {
        createHanoiHdLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiHdLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอย HD สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย HD:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอยสตาร์ - สร้างเที่ยงคืนทุกวัน // crojobs ผ่าน
cron.schedule(
  "5 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอยสตาร์...`
    );
    try {
      const {
        createHanoiStarLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiStarLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอยสตาร์ สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยสตาร์:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอย TV - สร้างเที่ยงคืนทุกวัน // crojobs ผ่าน
cron.schedule(
  "6 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอย TV...`
    );
    try {
      const {
        createHanoiTvLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiTvLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอย TV สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย TV:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอยเฉพาะกิจ - สร้างเที่ยงคืนทุกวัน // crojobs ผ่าน
cron.schedule(
  "7 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอยเฉพาะกิจ...`
    );
    try {
      const {
        createHanoiSpecialLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiSpecialLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอยเฉพาะกิจ สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยเฉพาะกิจ:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอยกาชาด - สร้างเที่ยงคืนทุกวัน // crojobs ผ่าน
cron.schedule(
  "8 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอยกาชาด...`
    );
    try {
      const {
        createHanoiRedcrossLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiRedcrossLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอยกาชาด สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยกาชาด:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอยพิเศษ - สร้างเที่ยงคืนทุกวัน  // error  เวลาปิดต้องมากกว่าเวลาเปิด
cron.schedule(
  "9 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอยพิเศษ...`
    );
    try {
      const {
        createHanoiSpecialApiLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiSpecialApiLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอยพิเศษ สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยพิเศษ:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอย - สร้างเที่ยงคืนทุกวัน  // error  เวลาปิดต้องมากกว่าเวลาเปิด
cron.schedule(
  "10 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอย...`
    );
    try {
      const {
        createHanoiLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอย สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอยพัฒนา - สร้างเที่ยงคืนทุกวัน // error  เวลาปิดต้องมากกว่าเวลาเปิด
cron.schedule(
  "11 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอยพัฒนา...`
    );
    try {
      const {
        createHanoiDevelopLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiDevelopLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอยพัฒนา สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอยพัฒนา:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอย VIP - สร้างเที่ยงคืนทุกวัน // error  เวลาปิดต้องมากกว่าเวลาเปิด
cron.schedule(
  "12 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอย VIP...`
    );
    try {
      const {
        createHanoiVipLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiVipLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอย VIP สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย VIP:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// หวยฮานอย EXTRA - สร้างเที่ยงคืนทุกวัน  // error  เวลาปิดต้องมากกว่าเวลาเปิด
cron.schedule(
  "13 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🇻🇳 สร้างหวยฮานอย EXTRA...`
    );
    try {
      const {
        createHanoiExtraLotteryWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createHanoiExtraLotteryWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยฮานอย EXTRA สำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยฮานอย EXTRA:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// ============= หวยยี้กี้ CRONJOBS เปิดเที่ยงคืน =============

// หวยยี้กี้ธรรม - สร้างเที่ยงคืนทุกวัน (96 รอบ/วัน ทุก 15 นาที)
cron.schedule(
  "14 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวยยี้กี้ธรรม 96 รอบ...`
    );
    try {
      const {
        createYiKeeRoundsWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createYiKeeRoundsWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยยี้กี้ธรรม 96 รอบสำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ธรรม:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// // หวยยี้กี้ 4G - สร้างเที่ยงคืนทุกวัน (144 รอบ/วัน ทุก 10 นาที)
cron.schedule(
  "15 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวยยี้กี้ 4G 144 รอบ...`
    );
    try {
      const {
        createYiKee4GRoundsWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createYiKee4GRoundsWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยยี้กี้ 4G 144 รอบสำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ 4G:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);

// // หวยยี้กี้ 5G - สร้างเที่ยงคืนทุกวัน (288 รอบ/วัน ทุก 5 นาที)
cron.schedule(
  "16 0 * * *",
  async () => {
    console.log(
      `[${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })}] 🎲 สร้างหวยยี้กี้ 5G 288 รอบ...`
    );
    try {
      const {
        createYiKee5GRoundsWithLog,
      } = require("../service/cronjob/cronjob.service");
      await createYiKee5GRoundsWithLog();
      console.log(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ✅ สร้างหวยยี้กี้ 5G 288 รอบสำเร็จ`
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}] ❌ เกิดข้อผิดพลาดในการสร้างหวยยี้กี้ 5G:`,
        error.message
      );
    }
  },
  { timezone: "Asia/Bangkok" }
);
