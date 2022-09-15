const router = require("express").Router();

const authenticateDeliveryBoy = require("../../middleware/authenticateDeliveryBoy");

const {
  getAllDeliveryOrders,
  changeStatusOfDeliveryOrder,
  changeStatusOfReturnOrder,
  getAllRequestedReturns,
} = require("../../controllers/deliveryBoy/ordersController");


router
  .route("/deliver/view/all/")
  .post(authenticateDeliveryBoy, getAllDeliveryOrders);
router
  .route("/return/:order_id")
  .post(authenticateDeliveryBoy, changeStatusOfReturnOrder);
router
  .route("/deliver/:order_id")
  .post(authenticateDeliveryBoy, changeStatusOfDeliveryOrder);

  router.route("/return/view/all").post(authenticateDeliveryBoy, getAllRequestedReturns);


module.exports = router;
