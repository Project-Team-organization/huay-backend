const express = require("express");
const router = express.Router();
const hentoryController = require("../controller/hentory/hentory.controller");
const { isUser } = require("../middleware/authadmin.middleware");

router.get("/catalog", isUser, hentoryController.getProducts);
router.get("/list", isUser, hentoryController.getGames);
router.post("/enter", isUser, hentoryController.loginGame);
router.get("/history", isUser, hentoryController.getBetTransactions);

module.exports = router;
