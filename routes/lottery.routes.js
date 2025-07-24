const express = require("express");
const router = express.Router();
const lotterySetsController = require("../controller/lottery/lotterySets.controller");
const lotteryTypeController = require("../controller/lottery/lotteryType.controller");
const huayController = require("../controller/lottery/huay.controller");
const bettingTypesController = require("../controller/lottery/bettingTypes.controller");
const lotteryResultsController = require("../controller/lottery/lottery_results.controller");
const LotteryLimitedNumbersController = require('../controller/lottery/lottery_limited_numbers.controller');
const { isAdmin } = require("../middleware/authadmin.middleware");
const { handleError } = require("puppeteer");

// Route to create a lottery Sets
router.post("/createSets", lotterySetsController.createLotterySets);
router.get("/getLotterySets", lotterySetsController.getLotterySets);
router.get("/getLotterySets/:id", lotterySetsController.getLotterySetsById);
router.put("/update/LotterySets/:id", lotterySetsController.updateLotterySets);
router.delete("/delete/all", lotterySetsController.deleteAllLotterySets);
router.delete("/delete/:id", lotterySetsController.deleteLottery);

// Route to create a lottery type
router.post("/createType", lotteryTypeController.createLotteryType);
router.get("/getType", lotteryTypeController.GetLotteryType);
router.delete(
  "/deleteLotteryType/:id",
  lotteryTypeController.DeleteLotteryType
);
router.put("/updateType/:id", lotteryTypeController.UpdateLotteryType);

//route  to create a Betting Types
router.post("/createBettingTypes", bettingTypesController.createBettingType);
router.get("/getBettingTypes", bettingTypesController.getBettingTypes);
router.get("/getBettingTypes/:id", bettingTypesController.getBettingTypeById);
router.put("/updateBettingTypes/:id", bettingTypesController.updateBettingType);
router.delete(
  "/deleteBettingTypes/:id",
  bettingTypesController.deleteBettingTypeById
);
router.get(
  "/getBettingTypesByLotteryType/:id",
  bettingTypesController.getBettingTypeByLotteryType
);

// Route to create a Huay ยังไม่ได้เริ่มใช้งาน
router.post("/createHuay", huayController.createHuay); //Create Huay Manual //รอเเก้ไข
router.post("/createHuayAPI", huayController.createHuayAPI); // Create Huay from API
router.get("/huay", huayController.getAllHuay); // Get Huay A;;
router.get("/huay/set/:id", huayController.getHuay); // Get Huay By Lotter Set
router.get("/huay/:id", huayController.getHuayById); // Get Huay by ID 
router.put("/huay/:id", huayController.updateHuay); // Update Huay //รอเเก้ไข

// ผลหวย

router.post("/getLotteryResult", isAdmin, huayController.evaluateLotteryResults); // ออกผลหวย

// 1. ดึงข้อมูล lotteryresults ทั้งหมด แบบ pagination
router.get("/lotteryresults", lotteryResultsController.getAllLotteryResults);

// 2. ดึงข้อมูล lotteryresults แบบ pagination by id
router.get("/lotteryresults/:id", lotteryResultsController.getLotteryResultById);

// 3. ดึงข้อมูล lotteryresults แบบ pagination by lottery_result_id
router.get("/lotteryresults/by-result/:lottery_result_id", lotteryResultsController.getLotteryResultsByResultId);

// 4. ดึงข้อมูล lotteryresults แบบ pagination by betting_type_id
router.get("/lotteryresults/by-betting-type/:betting_type_id", lotteryResultsController.getLotteryResultsByBettingType);

// 5. ลบข้อมูลจากผู้เล่นที่ถูกรางวัล
router.delete("/lotteryresults/:lottery_result_id", lotteryResultsController.deleteLotteryResultAndItems);


// 6. ค้นหาผลถูกรางวัล by lottery_result_id
router.get("/lotteryresults/winners/:lottery_result_id", lotteryResultsController.getLotteryWinners);

// ค้นหาผู้ชนะตาม lottery set และ user_id
router.get('/lotteryresults/winners/lottery-set/:lottery_set_id/:user_id', lotteryResultsController.getWinnersByLotterySetAndUser);


// //รายละเอียดผู้ถูกรางวัล
// router.get("/huay/:lottery_result_id/items", huayController.getLotteryResultItems); // ดูผลรางวัลแต่ละประเภท

// Routes for lottery limited numbers
router.get('/limited-numbers', LotteryLimitedNumbersController.getAllWithPagination);
router.get('/limited-numbers/:id', LotteryLimitedNumbersController.getById);
router.get('/limited-numbers/lottery-set/:lotterySetId', LotteryLimitedNumbersController.getByLotterySetId);

router.post('/limited-numbers', LotteryLimitedNumbersController.create);
router.put('/limited-numbers/:id', LotteryLimitedNumbersController.update);
router.delete('/limited-numbers/:id', LotteryLimitedNumbersController.delete);
// ดึงข้อมูลเลขที่มีการแทงสูงสุด by lotterySetId
router.get('/limited-numbers/lottery-set/:lotterySetId/top-betting', LotteryLimitedNumbersController.getTopBettingNumbers);
//
module.exports = router;
