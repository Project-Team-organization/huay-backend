const express = require("express");
const router = express.Router();
const hentoryController = require("../controller/hentory/hentory.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.get("/catalog", authmiddleware.isUser, hentoryController.getProducts);
router.get("/list", authmiddleware.isUser, hentoryController.getGames);

module.exports = router;
