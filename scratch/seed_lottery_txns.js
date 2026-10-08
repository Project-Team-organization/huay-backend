const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const UserTransaction = require("../models/user.transection.model");

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in env!");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB!");

  const userId = "697efe437538704d7acb2b3a";

  const mockTxns = [
    {
      user_id: userId,
      type: "bet",
      amount: 120.00,
      balance_before: 5000.00,
      balance_after: 4880.00,
      category: "lottery",
      provider_name: "YEEKEE",
      game_name: "หวยยี่กี รอบที่ 12",
      bet_id: "LOT-YK-99881",
      status: "LOSE",
      description: "เดิมพันหวยยี่กี เลข 3 ตัวบน [123] จำนวน 120 บาท",
      created_at: new Date(Date.now() - 3600000 * 24 * 2) // 2 days ago
    },
    {
      user_id: userId,
      type: "bet",
      amount: 50.00,
      balance_before: 4880.00,
      balance_after: 4830.00,
      category: "lottery",
      provider_name: "HANOI",
      game_name: "หวยฮานอยพิเศษ",
      bet_id: "LOT-HN-11234",
      status: "WIN",
      description: "เดิมพันหวยฮานอย เลข 2 ตัวล่าง [50] จำนวน 50 บาท",
      created_at: new Date(Date.now() - 3600000 * 12) // 12 hours ago
    },
    {
      user_id: userId,
      type: "payout",
      amount: 4500.00,
      balance_before: 4830.00,
      balance_after: 9330.00,
      category: "lottery",
      provider_name: "HANOI",
      game_name: "หวยฮานอยพิเศษ",
      bet_id: "LOT-HN-11234",
      status: "WIN",
      description: "ถูกรางวัลหวยฮานอย เลข 2 ตัวล่าง [50] อัตราจ่าย x90",
      created_at: new Date(Date.now() - 3600000 * 11) // 11 hours ago
    },
    {
      user_id: userId,
      type: "bet",
      amount: 100.00,
      balance_before: 9330.00,
      balance_after: 9230.00,
      category: "lottery",
      provider_name: "THAI",
      game_name: "หวยรัฐบาลไทย",
      bet_id: "LOT-TH-55660",
      status: "PENDING",
      description: "เดิมพันหวยรัฐบาลไทย เลข 3 ตัวโต๊ด [456] จำนวน 100 บาท",
      created_at: new Date()
    }
  ];

  await UserTransaction.insertMany(mockTxns);
  console.log("Mock lottery transactions seeded successfully!");
  mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
