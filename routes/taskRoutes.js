const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");

const {
  getAllTasks,
  getTaskById,
  getTasksByStatus,
  editTaskStatus,
} = require("../controllers/taskController");

router.route("/view/all").get(getAllTasks);
router.route("/view/:id").get(getTaskById);
router.route("/view/:status").get(getTasksByStatus);
router.route("/:id/:status").patch(editTaskStatus);

module.exports = router;
