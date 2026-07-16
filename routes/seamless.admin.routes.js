const express = require("express");
const router = express.Router();
const hentoryController = require("../controller/hentory/hentory.controller");
const { isAdmin } = require("../middleware/authadmin.middleware");

router.get("/getAgentCredit", isAdmin, hentoryController.getAgentCredit);
router.get("/betTransactionsV2", isAdmin, hentoryController.getBetTransactionsV2);
router.get("/products", isAdmin, hentoryController.getProducts);

module.exports = router;
