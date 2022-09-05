const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticateAdmin");

const {
  getAllDeliveryBoys,
  sendMessageToDeliveryBoy,
} = require("../../controllers/admin/deliveryBoyController");

router.route("/view/all").get(authenticate, getAllDeliveryBoys);
router.route("/validate").post(authenticate, sendMessageToDeliveryBoy);

module.exports = router;
