const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticateDeliveryBoy");

const {
  getAllDeliveries,
  getDeliveriesByStatus,
  getDeliveryById,
  modifyDeliveryStatus,
} = require("../controllers/deliveryController");

router.route("/view/all").get(authenticate, getAllDeliveries);
router.route("/view/id/:id").get(authenticate, getDeliveryById);
router.route("/view/status/:status").get(authenticate, getDeliveriesByStatus);
router.route("/modify/:id").patch(authenticate, modifyDeliveryStatus);

module.exports = router;
[]