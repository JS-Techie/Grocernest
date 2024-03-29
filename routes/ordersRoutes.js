const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const {
  getAllOrders,
  getOrderByOrderId,
  cancelOrder,
  returnOrder,
  trackOrder,
  getAllReturns,
  repeatOrder
} = require("../controllers/ordersController");


//Add authenticate middleware to all controllers 

router.route("/all").get(authenticate, getAllOrders);
router.route("/:orderId").get(authenticate, getOrderByOrderId);
router.route("/cancel/:orderId").post(authenticate, cancelOrder);
router.route("/return/:orderId").post(authenticate, returnOrder);
router.route("/:orderId/tracking").get(authenticate, trackOrder);
router.route("/return/view/all").post(authenticate, getAllReturns);
router.route("/repeat").post(authenticate,repeatOrder)

module.exports = router;
