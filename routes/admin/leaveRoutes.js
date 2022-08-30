const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllLeaves,
  getLeaveById,
  getLeaveByStatus,
  getLeaveByUserId,
  approveLeave,
  rejectLeave,
  createLeave,
  editLeave,
  deleteLeave,
} = require("../../controllers/admin/leaveController");

router.route("/view/all").get(authenticateAdmin, getAllLeaves);
router.route("/view/:id").get(authenticateAdmin, getLeaveById);
router.route("/view/status/:status").get(authenticateAdmin, getLeaveByStatus);
router.route("/view/user/:userId").get(authenticateAdmin, getLeaveByUserId);
router.route("/approve/:id").patch(authenticateAdmin, approveLeave);
router.route("/cancel/:id").patch(authenticateAdmin, rejectLeave);
router.route("/create").post(authenticateAdmin, createLeave);
router.route("/edit/:id").patch(authenticateAdmin, editLeave);
router.route("/delete/:id").delete(authenticateAdmin, deleteLeave);

module.exports = router;
