const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const {
  getProfile,
  uploadProfile,
  editProfile,
  editPhoneNumber,
  changePhoneNumber,
} = require("../controllers/profileController");

router.route("/view").get(authenticate, getProfile);
router.route("/upload").post(authenticate, uploadProfile);
router.route("/edit/details").patch(authenticate, editProfile);
router.route("/edit/phone").post(authenticate, editPhoneNumber)
router.route("/validate/phone").post(authenticate, changePhoneNumber)

module.exports = router;
