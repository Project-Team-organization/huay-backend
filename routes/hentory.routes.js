const express = require("express");
const router = express.Router();
const hentoryController = require("../controller/hentory/hentory.controller");
const basicAuth = require("../middleware/basicAuth.middleware");

router.get("/catalog", basicAuth, hentoryController.getProducts);
router.get("/list", basicAuth, hentoryController.getGames);

module.exports = router;
