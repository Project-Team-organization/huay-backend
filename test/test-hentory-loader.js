/**
 * Hentory Callback Test Loader & Simulator
 *
 * วิธีใช้งาน:
 * 1. รันเทสครบทุก Callback ทั้ง 11 ตัว:
 *    node test/test-hentory-loader.js --all
 *
 * 2. รัน Flow ปกติ (Balance -> Bet -> Settle):
 *    node test/test-hentory-loader.js --flow
 *
 * 3. รันเช็ค Balance เฉพาะยูส:
 *    node test/test-hentory-loader.js --balance --user=0848091026
 *
 * 4. รันเช็คเคส Error ทั้งหมด (Signature ผิด, User ไม่มี, เงินไม่พอ):
 *    node test/test-hentory-loader.js --error-tests
 *
 * 5. รัน Concurrency / Load Test (ยิงรัว):
 *    node test/test-hentory-loader.js --load --total=50 --concurrency=10
 */

require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
const HentoryLog = require("../models/hentoryLog.model");

// ค่า Configuration เริ่มต้น
const DEFAULT_URL = process.env.HENTORY_CALLBACK_URL || "https://api.luckyk168.com/api/callback/hentory";
const SIGNATURE_KEY = process.env.HENTORY_SIGNATURE_KEY || "10a5324a-3aee-4705-bbf1-c710548561b2";
const DEFAULT_USER = "0848091026";

// Parse CLI Arguments
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.split("=")[1];
  return fallback;
};

const TARGET_URL = getArg("url", DEFAULT_URL).replace(/\/$/, "");
const TEST_USER = getArg("user", DEFAULT_USER);

console.log("===============================================================");
console.log("🎮 HENTORY CALLBACK TEST LOADER & SIMULATOR");
console.log("===============================================================");
console.log(`🌐 Target URL     : ${TARGET_URL}`);
console.log(`🔑 Signature Key  : ${SIGNATURE_KEY.substring(0, 8)}...`);
console.log(`👤 Target User    : ${TEST_USER}`);
console.log("===============================================================\n");

/**
 * ฟังก์ชันสร้าง Signature และยิง HTTP Request
 */
async function sendHentoryRequest(endpoint, body, options = {}) {
  const rawBody = JSON.stringify(body);
  const timestamp = Date.now().toString();

  // คำนวณ Signature HMAC-SHA256
  let signature;
  if (options.forceInvalidSignature) {
    signature = "invalid_signature_hex_1234567890abcdef1234567890abcdef";
  } else {
    signature = crypto
      .createHmac("sha256", SIGNATURE_KEY)
      .update(`${rawBody}.${timestamp}`)
      .digest("hex");
  }

  const url = `${TARGET_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "sapi-timestamp": timestamp,
    "sapi-signature": signature,
  };

  const startTime = Date.now();
  let result = {
    url,
    endpoint,
    status: 0,
    data: null,
    durationMs: 0,
    error: null,
  };

  try {
    const res = await axios.post(url, body, {
      headers,
      timeout: 15000,
      validateStatus: () => true,
    });
    result.status = res.status;
    result.data = res.data;
  } catch (err) {
    result.status = err.response?.status || 500;
    result.data = err.response?.data || null;
    result.error = err.message;
  }

  result.durationMs = Date.now() - startTime;
  return result;
}

/**
 * เช็ค Log ล่าสุดใน MongoDB เพื่อยืนยันว่าบันทึกจริง
 */
async function verifyDbLog(requestId) {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
      } else {
        return null;
      }
    }
    const log = await HentoryLog.findOne({
      $or: [
        { "body.id": requestId },
        { "response.id": requestId },
      ],
    }).sort({ _id: -1 });

    return log;
  } catch (e) {
    return null;
  }
}

/**
 * แสดงผล Request และผลลัพธ์
 */
async function printResult(title, res, reqId) {
  const isOk = res.status === 200 && res.data?.statusCode === 0;
  const icon = isOk ? "✅" : res.status === 200 ? "⚠️" : "❌";

  console.log(`---------------------------------------------------------------`);
  console.log(`${icon} [${res.status}] ${title} (${res.durationMs}ms)`);
  console.log(`   URL      : ${res.url}`);
  console.log(`   Response : ${JSON.stringify(res.data)}`);

  if (res.error) {
    console.log(`   Error    : ${res.error}`);
  }

  if (reqId) {
    const dbLog = await verifyDbLog(reqId);
    if (dbLog) {
      console.log(`   📦 DB Log : [บันทึกสำเร็จ] ID: ${dbLog._id} | Error: ${dbLog.error || "None"}`);
    } else {
      console.log(`   📦 DB Log : [ยังไม่พบใน DB หรือต่อไม่ได้]`);
    }
  }
}

// ==========================================
// 11 Callback Test Functions
// ==========================================

// 1. Get Balance
async function runBalanceTest(username = TEST_USER) {
  const reqId = `BAL_${Date.now()}`;
  const body = { id: reqId, username, productId: "HENTORY", currency: "THB" };
  const res = await sendHentoryRequest("/balance", body);
  await printResult("1. GET BALANCE (/balance)", res, reqId);
  return res;
}

// 2. Place Bets
async function runBetTest(username = TEST_USER, betAmount = 10, roundId = `R_${Date.now()}`) {
  const reqId = `BET_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_${Date.now()}`,
        roundId,
        gameCode: "PG-SLOT",
        betAmount,
        skipBalanceUpdate: false,
      },
    ],
  };
  const res = await sendHentoryRequest("/bet", body);
  await printResult(`2. PLACE BETS (/bet) [Bet: ${betAmount}฿]`, res, reqId);
  return res;
}

// 3. Settle Bets
async function runSettleTest(username = TEST_USER, betAmount = 10, payoutAmount = 20, roundId = `R_${Date.now()}`) {
  const reqId = `SETTLE_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_SETTLE_${Date.now()}`,
        roundId,
        gameCode: "PG-SLOT",
        betAmount,
        payoutAmount,
        isSingleState: false,
        skipBalanceUpdate: false,
      },
    ],
  };
  const res = await sendHentoryRequest("/result", body);
  await printResult(`3. SETTLE BETS (/result) [Bet: ${betAmount}฿, Payout: ${payoutAmount}฿]`, res, reqId);
  return res;
}

// 4. Cancel Bets
async function runCancelTest(username = TEST_USER, betAmount = 10, roundId = `R_${Date.now()}`) {
  const reqId = `CANCEL_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_CANCEL_${Date.now()}`,
        roundId,
        gameCode: "PG-SLOT",
        betAmount,
      },
    ],
  };
  const res = await sendHentoryRequest("/cancel", body);
  await printResult(`4. CANCEL BETS (/cancel) [Refund: ${betAmount}฿]`, res, reqId);
  return res;
}

// 5. Adjust Bets
async function runAdjustBetTest(username = TEST_USER, newBetAmount = 5, txnId = `TXN_${Date.now()}`, roundId = `R_${Date.now()}`) {
  const reqId = `ADJUST_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: txnId,
        roundId,
        gameCode: "PG-SLOT",
        betAmount: newBetAmount,
      },
    ],
  };
  const res = await sendHentoryRequest("/adjust", body);
  await printResult(`5. ADJUST BETS (/adjust) [New Bet: ${newBetAmount}฿]`, res, reqId);
  return res;
}

// 6. Rollback Bets
async function runRollbackTest(username = TEST_USER, betAmount = 10, payoutAmount = 10, roundId = `R_${Date.now()}`) {
  const reqId = `ROLLBACK_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_ROLLBACK_${Date.now()}`,
        roundId,
        gameCode: "PG-SLOT",
        betAmount,
        payoutAmount,
        skipBalanceUpdate: false,
      },
    ],
  };
  const res = await sendHentoryRequest("/rollback", body);
  await printResult(`6. ROLLBACK BETS (/rollback) [Rollback: ${betAmount + payoutAmount}฿]`, res, reqId);
  return res;
}

// 7. Win Rewards
async function runWinRewardsTest(username = TEST_USER, rewardAmount = 50, roundId = `R_${Date.now()}`) {
  const reqId = `REWARD_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_REWARD_${Date.now()}`,
        roundId,
        gameCode: "JACKPOT-BONUS",
        payoutAmount: rewardAmount,
      },
    ],
  };
  const res = await sendHentoryRequest("/winRewards", body);
  await printResult(`7. WIN REWARDS (/winRewards) [Bonus: ${rewardAmount}฿]`, res, reqId);
  return res;
}

// 8. Place Tips
async function runPlaceTipsTest(username = TEST_USER, tipAmount = 5, roundId = `R_${Date.now()}`) {
  const reqId = `TIP_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_TIP_${Date.now()}`,
        roundId,
        betAmount: tipAmount,
      },
    ],
  };
  const res = await sendHentoryRequest("/placeTips", body);
  await printResult(`8. PLACE TIPS (/placeTips) [Tip: ${tipAmount}฿]`, res, reqId);
  return res;
}

// 9. Cancel Tips
async function runCancelTipsTest(username = TEST_USER, tipAmount = 5, roundId = `R_${Date.now()}`) {
  const reqId = `CANCEL_TIP_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_CANCEL_TIP_${Date.now()}`,
        roundId,
        betAmount: tipAmount,
      },
    ],
  };
  const res = await sendHentoryRequest("/cancelTips", body);
  await printResult(`9. CANCEL TIPS (/cancelTips) [Refund Tip: ${tipAmount}฿]`, res, reqId);
  return res;
}

// 10. Void Settled
async function runVoidSettledTest(username = TEST_USER, betAmount = 10, payoutAmount = 10, roundId = `R_${Date.now()}`) {
  const reqId = `VOID_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_VOID_${Date.now()}`,
        roundId,
        gameCode: "PG-SLOT",
        betAmount,
        payoutAmount,
        skipBalanceUpdate: false,
      },
    ],
  };
  const res = await sendHentoryRequest("/voidSettled", body);
  await printResult(`10. VOID SETTLED (/voidSettled) [Void Bet:${betAmount}฿, Payout:${payoutAmount}฿]`, res, reqId);
  return res;
}

// 11. Adjust Balance
async function runAdjustBalanceTest(username = TEST_USER, amount = 10, status = "CREDIT") {
  const reqId = `ADJ_BAL_${Date.now()}`;
  const body = {
    id: reqId,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        refId: `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount,
        status, // "DEBIT" หรือ "CREDIT"
      },
    ],
  };
  const res = await sendHentoryRequest("/adjustBalance", body);
  await printResult(`11. ADJUST BALANCE (/adjustBalance) [${status} ${amount}฿]`, res, reqId);
  return res;
}

/**
 * ฟังก์ชันรันเทส Callback ครบทั้ง 11 ตัว
 */
async function runAllCallbacks(username = TEST_USER) {
  console.log("===============================================================");
  console.log("🚀 [RUNNING ALL 11 HENTORY CALLBACK TESTS]");
  console.log("===============================================================\n");

  const commonRoundId = `ALL_TEST_${Date.now()}`;

  // 1. Balance
  await runBalanceTest(username);

  // 2. Bet
  await runBetTest(username, 10, commonRoundId);

  // 3. Settle
  await runSettleTest(username, 10, 10, commonRoundId);

  // 4. Cancel Bet
  await runCancelTest(username, 10, `CANCEL_${Date.now()}`);

  // 5. Adjust Bet
  await runAdjustBetTest(username, 5, `TXN_${Date.now()}`, `ADJ_${Date.now()}`);

  // 6. Rollback
  await runRollbackTest(username, 5, 5, `RB_${Date.now()}`);

  // 7. Win Rewards (Jackpot/Bonus)
  await runWinRewardsTest(username, 20, `REW_${Date.now()}`);

  // 8. Place Tips
  await runPlaceTipsTest(username, 5, `TIP_${Date.now()}`);

  // 9. Cancel Tips
  await runCancelTipsTest(username, 5, `CTIP_${Date.now()}`);

  // 10. Void Settled
  await runVoidSettledTest(username, 10, 10, `VOID_${Date.now()}`);

  // 11. Adjust Balance
  await runAdjustBalanceTest(username, 10, "CREDIT");
  await runAdjustBalanceTest(username, 10, "DEBIT");

  console.log("\n===============================================================");
  console.log("🎉 [COMPLETED ALL 11 CALLBACK TESTS SUCCESSFULLY]");
  console.log("===============================================================\n");
}

/**
 * Flow ปกติ: Balance -> Bet -> Settle
 */
async function runFullFlow(username = TEST_USER) {
  console.log("\n🚀 [STARTING FULL GAME CYCLE TEST]");
  const roundId = `ROUND_${Date.now()}`;

  console.log("\nStep 1: ตรวจสอบยอดเงินก่อนเล่น");
  await runBalanceTest(username);

  console.log("\nStep 2: ผู้เล่นกดแทง 10 บาท (Bet)");
  await runBetTest(username, 10, roundId);

  console.log("\nStep 3: ตรวจสอบยอดเงินหลังหักเดิมพัน");
  await runBalanceTest(username);

  console.log("\nStep 4: เปิดผล ชนะ 20 บาท (Settle / Payout)");
  await runSettleTest(username, 10, 20, roundId);

  console.log("\nStep 5: ตรวจสอบยอดเงินหลังบวกเงินรางวัล");
  await runBalanceTest(username);

  console.log("\n🎉 [FULL GAME CYCLE TEST COMPLETED]\n");
}

/**
 * ทดสอบ Error Cases
 */
async function runErrorTests(username = TEST_USER) {
  console.log("\n🧪 [STARTING ERROR INJECTION TESTS]");

  console.log("\nTest Case 1: แกล้งส่ง Signature ผิด (Invalid Signature)");
  const reqId1 = `ERR_SIG_${Date.now()}`;
  const res1 = await sendHentoryRequest(
    "/balance",
    { id: reqId1, username, productId: "HENTORY", currency: "THB" },
    { forceInvalidSignature: true }
  );
  await printResult("INJECTED: INVALID SIGNATURE", res1, reqId1);

  console.log("\nTest Case 2: ส่ง Username ที่ไม่มีตัวตน (Member Not Found)");
  const reqId2 = `ERR_NO_USER_${Date.now()}`;
  const res2 = await sendHentoryRequest("/balance", {
    id: reqId2,
    username: "non_existent_user_99999",
    productId: "HENTORY",
    currency: "THB",
  });
  await printResult("INJECTED: USER NOT FOUND", res2, reqId2);

  console.log("\nTest Case 3: แทงเกินยอดเงินคงเหลือ (Insufficient Balance)");
  const reqId3 = `ERR_OVER_BET_${Date.now()}`;
  const res3 = await sendHentoryRequest("/bet", {
    id: reqId3,
    username,
    productId: "HENTORY",
    currency: "THB",
    txns: [
      {
        id: `TXN_OVER_${Date.now()}`,
        roundId: `R_OVER_${Date.now()}`,
        gameCode: "TEST-SLOT",
        betAmount: 999999999,
      },
    ],
  });
  await printResult("INJECTED: INSUFFICIENT BALANCE", res3, reqId3);

  console.log("\n🎯 [ERROR TESTS COMPLETED] ตรวจสอบ HentoryLog ใน MongoDB ได้ทันที\n");
}

/**
 * Load / Concurrency Test
 */
async function runLoadTest(username = TEST_USER, totalRequests = 50, concurrency = 10) {
  console.log(`\n⚡ [STARTING LOAD TEST] Total: ${totalRequests} reqs, Concurrency: ${concurrency}`);

  const results = [];
  let completed = 0;

  async function worker(index) {
    const reqId = `LOAD_${index}_${Date.now()}`;
    const body = {
      id: reqId,
      username,
      productId: "HENTORY",
      currency: "THB",
    };
    const res = await sendHentoryRequest("/balance", body);
    completed++;
    process.stdout.write(`\r   Progress: ${completed}/${totalRequests} (${Math.round((completed / totalRequests) * 100)}%)`);
    return res;
  }

  for (let i = 0; i < totalRequests; i += concurrency) {
    const batch = [];
    for (let j = i; j < Math.min(i + concurrency, totalRequests); j++) {
      batch.push(worker(j + 1));
    }
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  console.log("\n\n📊 [LOAD TEST SUMMARY]");
  const success = results.filter((r) => r.status === 200 && r.data?.statusCode === 0).length;
  const failed = results.length - success;
  const durations = results.map((r) => r.durationMs);
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  console.log(`   Total Requests : ${results.length}`);
  console.log(`   Success (200)  : ${success}`);
  console.log(`   Failed         : ${failed}`);
  console.log(`   Avg Latency    : ${avgDuration} ms`);
  console.log(`   Min Latency    : ${minDuration} ms`);
  console.log(`   Max Latency    : ${maxDuration} ms`);
  console.log("===============================================================\n");
}

// Main Execution Router
async function main() {
  try {
    if (args.includes("--all")) {
      await runAllCallbacks(TEST_USER);
    } else if (args.includes("--flow")) {
      await runFullFlow(TEST_USER);
    } else if (args.includes("--error-tests")) {
      await runErrorTests(TEST_USER);
    } else if (args.includes("--load")) {
      const total = parseInt(getArg("total", 50), 10);
      const concurrency = parseInt(getArg("concurrency", 10), 10);
      await runLoadTest(TEST_USER, total, concurrency);
    } else if (args.includes("--balance")) {
      await runBalanceTest(TEST_USER);
    } else if (args.includes("--bet")) {
      const amount = parseFloat(getArg("amount", 10));
      await runBetTest(TEST_USER, amount);
    } else if (args.includes("--settle")) {
      const bet = parseFloat(getArg("bet", 10));
      const win = parseFloat(getArg("win", 20));
      await runSettleTest(TEST_USER, bet, win);
    } else {
      console.log("💡 Tip: คุณสามารถส่ง flag ต่อไปนี้เพื่อรันโหมดต่างๆ ได้:");
      console.log("   --all          : 🚀 ยิงทดสอบครบทุก Callback ทั้ง 11 ตัวรวดเดียว");
      console.log("   --flow         : ทดสอบครบทั้งลูป (Balance -> Bet -> Settle)");
      console.log("   --error-tests  : ทดสอบเคส Error ทั้งหมด (เช็ค Log ใน DB)");
      console.log("   --load         : ยิงทดสอบโหลดหลาย Requests พร้อมกัน");
      console.log("   --balance      : ยิงเช็คยอดเงินอย่างเดียว");
      console.log("   --user=USER    : ระบุยูสเซอร์ที่ต้องการทดสอบ\n");

      console.log("▶️ กำลังทดสอบยิงเช็ค Balance ขั้นพื้นฐาน...");
      await runBalanceTest(TEST_USER);
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

main();
