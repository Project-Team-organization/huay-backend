const express = require("express");
const router = express.Router();
const controller = require("../controller/promoBanner/promoBanner.controller");
const { permissionmanageradmin } = require("../middleware/authadmin.middleware");
const { uploadImage } = require("../utils/promoBannerUpload");

// ต้องประกาศ /public, /admin, /reorder ก่อน /:id
router.get("/public", controller.getPublic);
router.get("/admin", permissionmanageradmin, controller.getAdmin);
router.put("/reorder", permissionmanageradmin, controller.reorder);
router.post("/", permissionmanageradmin, uploadImage, controller.create);
router.put("/:id", permissionmanageradmin, uploadImage, controller.update);
router.delete("/:id", permissionmanageradmin, controller.remove);

module.exports = router;
