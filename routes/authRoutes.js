const express = require("express")
const router = express.Router();

//const authenticate = require("../middleware/authentication") 

const{
    login,
    register,
    verifyOTP,
    forgotPassword,
    changePassword,
    verifyToken,
    resendToken
} = require("../controllers/authController")

router.route("/register").post(register);
router.route("/verify").post(verifyOTP);
router.route("/login").post(login);
router.route("/forgotPassword").post(forgotPassword)
router.route("/verifyToken").post(verifyToken)
router.route("/changePassword").post(changePassword)

router.route("/resendToken").post(resendToken)





module.exports = router;