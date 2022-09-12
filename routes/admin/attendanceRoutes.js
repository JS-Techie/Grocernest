const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticateAdmin");

const {
  getAttendanceByUserId,
  getAttendanceDetails,
} = require("../../controllers/admin/attendanceController");

router.route("/view/all").get(authenticate, getAttendanceDetails);
router.route("/view/:id").get(authenticate, getAttendanceByUserId);

module.exports = router;
