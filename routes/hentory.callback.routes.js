const express = require("express");
const router = express.Router();
const ipWhitelist = require("../middleware/ipWhitelist.middleware");
const hentorySignature = require("../middleware/hentorySignature.middleware");
const hentoryCallbackController = require("../controller/hentory/hentory.callback.controller");

// router.use(ipWhitelist);
router.use(hentorySignature);

router.post(["/balance", "/checkBalance"], hentoryCallbackController.getBalance);
router.post(["/bet", "/placeBets"], hentoryCallbackController.placeBets);
router.post(["/result", "/settleBets"], hentoryCallbackController.settleBets);
router.post(["/cancel", "/cancelBets"], hentoryCallbackController.cancelBets);
router.post(["/adjust", "/adjustBets"], hentoryCallbackController.adjustBets);
router.post(["/rollback", "/rollbackBets"], hentoryCallbackController.rollbackBets);
router.post(["/winRewards", "/reward"], hentoryCallbackController.winRewards);
router.post(["/placeTips", "/tips"], hentoryCallbackController.placeTips);
router.post(["/cancelTips", "/cancelTip"], hentoryCallbackController.cancelTips);
router.post(["/voidSettled", "/void"], hentoryCallbackController.voidSettled);
router.post("/adjustBalance", hentoryCallbackController.adjustBalance);

module.exports = router;
