const express = require("express");
const router = express.Router();
const siteSettingController = require("../controller/siteSetting.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");

router.get("/", siteSettingController.getSiteSettings);
router.put("/", permissionmanageradmin, siteSettingController.updateSiteSettings);

module.exports = router;
