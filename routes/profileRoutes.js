const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const {
  getProfile,
  uploadProfile,
  editProfile,
} = require("../controllers/profileController");

router.route("/view").get(authenticate, getProfile);
router.route("/upload").post(authenticate, uploadProfile);
router.route("/edit").patch(authenticate, editProfile);

module.exports = router;
