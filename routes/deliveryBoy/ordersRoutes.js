const router = require("express").Router();

const authenticateDeliveryBoy = require("../../middleware/authenticateDeliveryBoy");

const {
  getAllOrders,
  getOrderById,
  getOrderByStatus,
  changeStatusOfDeliveryOrder,
  changeStatusOfReturnOrder,
  getAllRequestedReturns,
  getAllDeliveryOrders
} = require("../../controllers/deliveryBoy/ordersController");

router.route("/view/all").get(authenticateDeliveryBoy, getAllOrders);
router.route("/view/:order_id").get(authenticateDeliveryBoy, getOrderById);
router
  .route("/view/status/:status")
  .get(authenticateDeliveryBoy, getOrderByStatus);
router
  .route("/return/:order_id")
  .post(authenticateDeliveryBoy, changeStatusOfReturnOrder);
router
  .route("/deliver/:order_id")
  .post(authenticateDeliveryBoy, changeStatusOfDeliveryOrder);

  router.route("/return/view/all").post(authenticateDeliveryBoy, getAllRequestedReturns);
  router.route("/deliver/view/all").get(authenticateDeliveryBoy, getAllDeliveryOrders);

module.exports = router;
