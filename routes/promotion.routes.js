const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");
const { isAdmin, isUser } = require("../middleware/authadmin.middleware");
const { uploadImage } = require("../utils/promoBannerUpload");

router.post("/", isAdmin, promotionController.createPromotion);
router.post("/createByUserID", isAdmin, promotionController.createPromotionByUserID);
router.get("/", promotionController.getAllPromotions);
router.get("/user", isUser, promotionController.getAllUserPromotions);
router.get("/user/:id", isUser, promotionController.getUserPromotionsById);
// NOTE: "/public" must be declared before "/:id" or it is swallowed as an id.
router.get("/public", promotionController.getPublicPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", isAdmin, promotionController.updatePromotion);
router.patch("/:id", isAdmin, promotionController.updatePromotion);
router.post("/upload/:id", isAdmin, uploadImage, promotionController.uploadFile);
router.delete("/upload/:id", isAdmin, promotionController.deletePromotionImage);
router.delete("/image/:id", isAdmin, promotionController.deletePromotionImage);
router.delete("/:id", isAdmin, promotionController.deletePromotionById);
router.delete("/delete/:id", isAdmin, promotionController.deletePromotionById);

module.exports = router;
