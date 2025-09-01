const express = require("express");
const router = express.Router();
const lotterySetsController = require("../controller/lottery/lotterySets.controller");
const lotteryTypeController = require("../controller/lottery/lotteryType.controller");
const huayController = require("../controller/lottery/huay.controller");
const bettingTypesController = require("../controller/lottery/bettingTypes.controller");
const lotteryResultsController = require("../controller/lottery/lottery_results.controller");
const LotteryLimitedNumbersController = require('../controller/lottery/lottery_limited_numbers.controller');
const { isAdmin } = require("../middleware/authadmin.middleware");
const lotteryWinnersController = require('../controller/lottery/lottery_winners.controller');
const { handleError } = require("puppeteer");
const { fetchLatestLaoLottery, getAllLaoLottery } = require('../controller/lottery/lottery_lao.controller');
const { fetchLatestLaoExtraLottery, getAllLaoExtraLottery } = require('../controller/lottery/lottery_lao_extra.controller');
const { fetchLatestLaoStarsLottery, getAllLaoStarsLottery } = require('../controller/lottery/lottery_lao_stars.controller');
const { fetchLatestLaoStarsVipLottery, getAllLaoStarsVipLottery } = require('../controller/lottery/lottery_lao_stars_vip.controller');
const { fetchLatestLaoRedcrossLottery, getAllLaoRedcrossLottery } = require('../controller/lottery/lottery_lao_redcross.controller');
const { fetchLatestLaoThakhekVipLottery, getAllLaoThakhekVipLottery } = require('../controller/lottery/lottery_lao_thakhek_vip.controller');
const { fetchLatestLaoThakhek5dLottery, getAllLaoThakhek5dLottery } = require('../controller/lottery/lottery_lao_thakhek_5d.controller');
const { fetchLatestLaoTvLottery, getAllLaoTvLottery } = require('../controller/lottery/lottery_lao_tv.controller');
const { fetchLatestLaoVipLottery, getAllLaoVipLottery } = require('../controller/lottery/lottery_lao_vip.controller');
const { fetchLatestLaoHdLottery, getAllLaoHdLottery } = require('../controller/lottery/lottery_lao_hd.controller');
const lotteryLaoUnionController = require('../controller/lottery/lottery_lao_union.controller');
const { fetchLatestThaiSavingsLottery, getAllThaiSavingsLottery } = require('../controller/lottery/lottery_thai_savings.controller');
const { fetchLatestThaiGsbLottery, getAllThaiGsbLottery } = require('../controller/lottery/lottery_thai_gsb.controller');
const { fetchLatestMagnum4dLottery, getAllMagnum4dLottery } = require('../controller/lottery/lottery_magnum_4d.controller');
const { fetchLatestSingapore4dLottery, getAllSingapore4dLottery } = require('../controller/lottery/lottery_singapore_4d.controller');

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
router.post("/createManualHuay", huayController.createManualHuay); // Create Manual Huay with auto-generation
router.post("/createHuayAPI", huayController.createHuayAPI); // Create Huay from API
router.get("/huay", huayController.getAllHuay); // Get Huay A;;
router.get("/huay/set/:id", huayController.getHuay); // Get Huay By Lotter Set
router.get("/huay/:id", huayController.getHuayById); // Get Huay by ID 
router.put("/huay/:id", huayController.updateHuay); // Update Huay //รอเเก้ไข

// huay ล่าสุด ที่ออก
router.get("/huay/latest/result", huayController.getLatestResultedHuay);

// ผลหวย

router.post("/getLotteryResult", isAdmin, huayController.evaluateLotteryResults); // ออกผลหวย






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

// รายละเอียดผู้ถูกรางวัล 
router.get("/lotteryresults/winners/:lottery_result_id", lotteryWinnersController.getLotteryWinners);

// winlotterywinners
router.get('/winners', lotteryWinnersController.getAllWinners);
router.get('/winners/:id', lotteryWinnersController.getWinnerById);

//lotteryresults
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

// 6. lotteryresultitems   by lottery_set_id
router.get("/lotteryresultitems/lottery-set/:lottery_set_id", lotteryResultsController.getLotteryResultItemsByLotterySetId);


//สร้างข้อมูลหวยลาว
router.post('/lao/latest', fetchLatestLaoLottery);

//ดึงข้อมูลหวยลาวทั้งหมดแบบ pagination
router.get('/lao', getAllLaoLottery);

//สร้างข้อมูลหวยลาว Extra
router.post('/lao-extra/latest', fetchLatestLaoExtraLottery);

//ดึงข้อมูลหวยลาว Extra ทั้งหมดแบบ pagination
router.get('/lao-extra', getAllLaoExtraLottery);

//สร้างข้อมูลหวยลาวสตาร์
router.post('/lao-stars/latest', fetchLatestLaoStarsLottery);

//ดึงข้อมูลหวยลาวสตาร์ทั้งหมดแบบ pagination
router.get('/lao-stars', getAllLaoStarsLottery);

// Lao Union Lottery Routes
router.post('/lao-union/latest', lotteryLaoUnionController.fetchLatestResult);
router.get('/lao-union', lotteryLaoUnionController.getLatestResult);

//สร้างข้อมูลหวยลาวสตาร์ VIP
router.post('/lao-stars-vip/latest', fetchLatestLaoStarsVipLottery);

//ดึงข้อมูลหวยลาวสตาร์ VIP ทั้งหมดแบบ pagination
router.get('/lao-stars-vip', getAllLaoStarsVipLottery);

//สร้างข้อมูลหวยลาวกาชาด
router.post('/lao-redcross/latest', fetchLatestLaoRedcrossLottery);

//ดึงข้อมูลหวยลาวกาชาดทั้งหมดแบบ pagination
router.get('/lao-redcross', getAllLaoRedcrossLottery);

//สร้างข้อมูลหวยลาวท่าแขก VIP
router.post('/lao-thakhek-vip/latest', fetchLatestLaoThakhekVipLottery);

//ดึงข้อมูลหวยลาวท่าแขก VIP ทั้งหมดแบบ pagination
router.get('/lao-thakhek-vip', getAllLaoThakhekVipLottery);

//สร้างข้อมูลหวยลาวท่าแขก 5D
router.post('/lao-thakhek-5d/latest', fetchLatestLaoThakhek5dLottery);

//ดึงข้อมูลหวยลาวท่าแขก 5D ทั้งหมดแบบ pagination
router.get('/lao-thakhek-5d', getAllLaoThakhek5dLottery);

//สร้างข้อมูลหวยลาว TV
router.post('/lao-tv/latest', fetchLatestLaoTvLottery);

//ดึงข้อมูลหวยลาว TV ทั้งหมดแบบ pagination
router.get('/lao-tv', getAllLaoTvLottery);

//สร้างข้อมูลหวยลาว VIP
router.post('/lao-vip/latest', fetchLatestLaoVipLottery);

//ดึงข้อมูลหวยลาว VIP ทั้งหมดแบบ pagination
router.get('/lao-vip', getAllLaoVipLottery);

//สร้างข้อมูลหวยลาว HD
router.post('/lao-hd/latest', fetchLatestLaoHdLottery);

//ดึงข้อมูลหวยลาว HD ทั้งหมดแบบ pagination
router.get('/lao-hd', getAllLaoHdLottery);

//สร้างข้อมูลหวยออมสิน
router.post('/thai-savings/latest', fetchLatestThaiSavingsLottery);

//ดึงข้อมูลหวยออมสินทั้งหมดแบบ pagination
router.get('/thai-savings', getAllThaiSavingsLottery);

//สร้างข้อมูลหวย ธกส
router.post('/thai-gsb/latest', fetchLatestThaiGsbLottery);

//ดึงข้อมูลหวย ธกส ทั้งหมดแบบ pagination
router.get('/thai-gsb', getAllThaiGsbLottery);

//สร้างข้อมูลหวย Magnum 4D
router.post('/magnum-4d/latest', fetchLatestMagnum4dLottery);

//ดึงข้อมูลหวย Magnum 4D ทั้งหมดแบบ pagination
router.get('/magnum-4d', getAllMagnum4dLottery);

//สร้างข้อมูลหวย Singapore 4D
router.post('/singapore-4d/latest', fetchLatestSingapore4dLottery);

//ดึงข้อมูลหวย Singapore 4D ทั้งหมดแบบ pagination
router.get('/singapore-4d', getAllSingapore4dLottery);


module.exports = router;
