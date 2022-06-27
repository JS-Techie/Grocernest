const express = require("express");
const router = express.Router();

const {
  login,
  register,
  verifyOTP,
  forgotPassword,
  changePassword,
  verifyToken,
  resendToken,
  getOTP,
  getToken,
} = require("../controllers/authController");

router.route("/register").post(register);
router.route("/getOTP").get(getOTP);
router.route("/verify").post(verifyOTP);
router.route("/login").post(login);
router.route("/forgotPassword").post(forgotPassword);
router.route("/getToken").get(getToken);
router.route("/verifyToken").post(verifyToken);
router.route("/changePassword").post(changePassword);

// router.route("/resendToken").post(resendToken)

module.exports = router;
