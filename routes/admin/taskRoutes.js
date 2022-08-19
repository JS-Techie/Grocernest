const express = require("express");
const router = express.Router();

// const authenticateAdmin = require("../../middleware/authenticateAdmin");

router.route("/view/all").get(getAllTasks);
router.route("/view/:id").get(getTaskById);
router.route("/create").post(createTask);
router.route("/edit/:id").patch(editTask);
router.route("delete/:id").delete(deleteTask);


module.exports = router;