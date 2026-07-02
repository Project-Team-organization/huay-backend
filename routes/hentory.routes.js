const express = require("express");
const router = express.Router();
const hentoryController = require("../controller/hentory/hentory.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.get("/products", authmiddleware.isUser, hentoryController.getProducts);
router.get("/games", authmiddleware.isUser, hentoryController.getGames);

module.exports = router;
