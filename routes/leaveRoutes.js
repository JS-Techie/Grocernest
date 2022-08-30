const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticateUser");

const {
  getAllLeaves,
  getLeaveById,
  getLeaveByStatus,
  createLeave,
  editLeave,
  deleteLeave,
} = require("../controllers/leaveController");

router.route("/view/all").get(authenticate, getAllLeaves);
router.route("/view/:id").get(authenticate, getLeaveById);
router.route("/view/status/:status").get(authenticate, getLeaveByStatus);
router.route("/create").post(authenticate, createLeave);
router.route("/edit/:id").patch(authenticate, editLeave);
router.route("/delete/:id").delete(authenticate, deleteLeave);

module.exports = router;
