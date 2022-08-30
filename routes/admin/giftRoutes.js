const express = require("express");
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
  getGifts,
  viewStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  getStrategyById,
} = require("../../controllers/admin/giftController");

router.route("/all").get(admin, getGifts);
router.route("/strategy/all").get(admin, viewStrategies);
router.route("/strategy/:id").get(admin, getStrategyById);
router.route("/create/strategy").post(admin, createStrategy);
router.route("/update/strategy/:id").patch(admin, updateStrategy);
router.route("/delete/strategy/:id").delete(admin, deleteStrategy);

module.exports = router;
