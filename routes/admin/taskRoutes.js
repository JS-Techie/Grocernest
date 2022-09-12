const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllTasks,
  getTaskById,
  createTask,
  editTask,
  editTaskStatus,
  deleteTask,
  getTaskByStatus
} = require("../../controllers/admin/taskController");

router.route("/view/all").get(authenticateAdmin, getAllTasks);
router.route("/view/:id").get(authenticateAdmin, getTaskById);
router.route("/create").post(authenticateAdmin, createTask);
router.route("/edit/:id").patch(authenticateAdmin, editTask);
router.route("/edit/:id/:status").patch(authenticateAdmin, editTaskStatus);
router.route("/delete/:id").delete(authenticateAdmin, deleteTask);
router.route("/view/status/:status").get(authenticateAdmin, getTaskByStatus)

module.exports = router;
