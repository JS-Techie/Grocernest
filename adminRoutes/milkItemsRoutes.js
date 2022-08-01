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

router.route("/view/all").get(getAllItems);
router.route("/view/:itemID").get(getItemByID);
router.route("/create").post(createItem);
router.route("/edit/:itemID").patch(editItem);
router.route("/delete/:itemID").delete(deleteItem);

module.exports = router;
