const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticateUser");

const {
  registerLoginTime,
  registerLogoutTime,
} = require("../controllers/attendanceController");

router.route("/attendance/login").post(authenticate, registerLoginTime);
router.route("/attendance/logout").post(authenticate, registerLogoutTime);

module.exports = router;
