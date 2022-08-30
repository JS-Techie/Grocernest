const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");

const {
  getAllTasks,
  getTaskById,
  getTasksByStatus,
  editTaskStatus,
} = require("../controllers/taskController");

router.route("/view/all").get(authenticateUser, getAllTasks);
router.route("/view/:id").get(authenticateUser, getTaskById);
router.route("/view/:status").get(authenticateUser, getTasksByStatus);
router.route("/:id/:status").patch(authenticateUser, editTaskStatus);

module.exports = router;
