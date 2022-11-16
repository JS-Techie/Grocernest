const router = require("express").Router();

//authenticate vendor
const authenticateVendor = require("../../middleware/authenticateVendor");

const {
  getVendorProfile,
  editVendorProfile,
  loginVendor,
  forgotPasswordForVendor,
  changeVendorPassword,
  verifyOTPOfVendor,
  editPhoneNumber,
  changePhoneNumber,
  getAllItemsMappedToVendor
} = require("../../controllers/vendor/profileController");

router.route("/login").post(loginVendor);
router.route("/forgotPassword").post(forgotPasswordForVendor);
router.route("/changePassword").post(changeVendorPassword);
router.route("/verify").post(verifyOTPOfVendor);
router.route("/view").get(authenticateVendor, getVendorProfile);
router.route("/edit").patch(authenticateVendor, editVendorProfile);
router.route("/change/phone").post(authenticateVendor, editPhoneNumber);
router.route("/verify/phone").post(authenticateVendor, changePhoneNumber);
router.route("/view/items").get(authenticateVendor, getAllItemsMappedToVendor);

module.exports = router;
