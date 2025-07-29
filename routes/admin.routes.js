const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/admin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.post(
  "/create",
  authmiddleware.permissionmanageradmin,
  adminController.createAdmin
);
router.get(
  "/get",
  authmiddleware.permissionmanageradmin,
  adminController.getAdmin
);
router.get(
  "/getbyid/:id",
  authmiddleware.permissionmanageradmin,
  adminController.getAdminById
);
router.put(
  "/update/:id",
  authmiddleware.permissionmanageradmin,
  adminController.updateAdmin
);
router.delete(
  "/delete/:id",
  authmiddleware.permissionmanageradmin,
  adminController.deleteAdmin
);

// active admin
router.put(
  "/active/:id",
  authmiddleware.permissionmanageradmin,
  adminController.activeadmin
);
// disactive admin
router.put(
  "/disactive/:id",
  authmiddleware.permissionmanageradmin,
  adminController.disactiveadmin
);




//history user bet
router.get(
  "/user/bet",
  authmiddleware.permissionmanageradmin,
  adminController.getUserBetAll
);

router.get(
  "/user/bet/:id",
  authmiddleware.permissionmanageradmin,
  adminController.getUserBetById
);

// user transactions
router.get(
  "/user/transactions/",
  authmiddleware.permissionmanageradmin,
  adminController.getUserTransactions
);

// user transactions by id
router.get(
  "/user/transactions/:id",
  authmiddleware.permissionmanageradmin,
  adminController.getUserTransactionById
);

// user transactions by user_id
router.get(
  "/user/transactions/user_id/:user_id",
  authmiddleware.permissionmanageradmin,
  adminController.getUserTransactionsByUserId
);




// router.get(
//   "/user/bet/:user_id",
//   authmiddleware.permissionmanageradmin,
//   adminController.getUserBetByIdUser
// );





module.exports = router;
