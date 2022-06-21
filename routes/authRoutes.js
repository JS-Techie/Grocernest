const express = require("express")
const router = express.Router();

const{
    loginUser,
    registerUser,
    verifyOTP,
    forgotPassword
} = require("../controllers/authController")

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/verify").post(verifyOTP);
// router.route("/resendToken")
router.route("/forgotPassword").post(forgotPassword)


module.exports = router;