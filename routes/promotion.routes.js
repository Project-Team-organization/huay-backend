const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");
const multer = require("multer");

router;

const { uploadImage } = require("../utils/promoBannerUpload");

router.post("/", promotionController.createPromotion);
router.post("/createByUserID", promotionController.createPromotionByUserID);
router.get("/", promotionController.getAllPromotions);
router.get("/user", promotionController.getAllUserPromotions);
router.get("/user/:id", promotionController.getUserPromotionsById);
// NOTE: "/public" must be declared before "/:id" or it is swallowed as an id.
router.get("/public", promotionController.getPublicPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.patch("/:id", promotionController.updatePromotion);
router.post("/upload/:id", uploadImage, promotionController.uploadFile);
router.delete("/upload/:id", promotionController.deletePromotionImage);
router.delete("/image/:id", promotionController.deletePromotionImage);
router.delete("/:id", promotionController.deletePromotionById);
router.delete("/delete/:id", promotionController.deletePromotionById);

module.exports = router;
