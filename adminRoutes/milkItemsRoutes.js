const express = require("express");
const router = express.Router();

const admin = require("../middleware/authenticateAdmin");

const {
  getAllItems,
  getItemByID,
  createItem,
  editItem,
  deleteItem,
} = require("../adminControllers/milkItemsController");

router.route("/view/all").get(admin, getAllItems);
router.route("/view/:itemID").get(admin, getItemByID);
router.route("/create").post(admin, createItem);
router.route("/edit/:itemID").patch(admin, editItem);
router.route("/delete/:itemID").delete(admin, deleteItem);

module.exports = router;
