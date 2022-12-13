const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getOrdersByDate,
  getOrdersByDeliveryBoy,
} = require("../../controllers/admin/dailySalesController");

router.route("/view").post(getOrdersByDate);
router.route("/view/delivery").post(getOrdersByDeliveryBoy);

module.exports = router;
