const router = require("express").Router();

const {
  getVendorProfile,
  editVendorProfile,
  loginVendor,
  forgotPasswordForVendor,
  changeVendorPassword,
  verifyOTPOfVendor,
} = require("../../controllers/vendor/profileController");

router.route("/view").get(getVendorProfile);
router.route("/edit").patch(editVendorProfile);
router.route("/login").post(loginVendor);
router.route("/forgotPassword").post(forgotPasswordForVendor);
router.route("/changePassword").post(changeVendorPassword);
router.route("/verify").post(verifyOTPOfVendor);

module.exports = router;
