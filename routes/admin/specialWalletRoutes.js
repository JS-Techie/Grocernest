const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  createStrategy,
  viewStrategy,
  editStrategy,
  deleteStrategy,
  toggleStrategy,
  viewDeleteHistory
} = require("../../controllers/admin/specialWalletController.js");

// authenticateAdmin
router.route("/create").post(createStrategy);
router.route("/view").get(viewStrategy);
router.route("/view/delete").get(viewDeleteHistory);
router.route("/edit").post(editStrategy);
router.route("/delete").post(deleteStrategy);

router.route("/toggle").post(toggleStrategy);

module.exports = router;
