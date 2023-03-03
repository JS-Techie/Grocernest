const express = require("express");
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin");

const {
  saveUser,
  updateUser,
  getAllUser,
  getBasicUserDetails,
  getUserDetails,
  tellerList,
  activateUser,
  deactivateUser,
  getActiveUsers,
  getDeactivateUsers,
} = require("../../../controllers/inventory/masterData/userController");

router.route("/secure/user/admin/save").post(authenticate, saveUser);
router
  .route("/secure/user/admin/update/:userId")
  .post(authenticate, updateUser);
router.route("/secure/user/users").post(authenticate, getAllUser);
router
  .route("/secure/user/getBasicUserDetails")
  .post(authenticate, getBasicUserDetails);
router.route("/secure/user/details/:userId").post(authenticate, getUserDetails);
router.route("/secure/user/tellerList").post(authenticate, tellerList);
router
  .route("/secure/user/admin/activate/:userId")
  .post(authenticate, activateUser);
router
  .route("/secure/user/admin/deactivate/:userId")
  .post(authenticate, deactivateUser);
router.route("/secure/user/users/active").post(authenticate, getActiveUsers);
router
  .route("/secure/user/users/deactive")
  .post(authenticate, getDeactivateUsers);

module.exports = router;
