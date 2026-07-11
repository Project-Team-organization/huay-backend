const express = require("express");
const router = express.Router();
const logoController = require("../controller/upload/logo.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");

router.post("/upload/:type", permissionmanageradmin, logoController.uploadLogo);
router.get("/:type", logoController.getLogo);

module.exports = router;
