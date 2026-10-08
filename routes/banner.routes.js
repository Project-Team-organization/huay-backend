const express = require("express");
const router = express.Router();
const bannerController = require("../controller/banner/banner.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");

// Public route for user app/web slider
router.get("/public", bannerController.getPublicBanners);

// Protected admin routes
router.get("/", permissionmanageradmin, bannerController.getBanners);
router.post("/", permissionmanageradmin, bannerController.uploadMiddleware, bannerController.createBanner);
router.put("/:id", permissionmanageradmin, bannerController.uploadMiddleware, bannerController.updateBanner);
router.patch("/:id/status", permissionmanageradmin, bannerController.toggleBannerStatus);
router.delete("/:id", permissionmanageradmin, bannerController.deleteBanner);

module.exports = router;
