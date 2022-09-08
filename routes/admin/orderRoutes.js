const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllPendingOrders,
  getOrderDetails,
  changeOrderStatus,
  acceptedOrders,
  assignTransporter,
  getShippedOrders,
  getDeliveredOrders,
  getCanceledorders,
  getAllOrderByPhoneNumber,
  assignDeliveryBoyForReturn,
  rejectRequestedReturn,
  getRequestedReturns,
} = require("../../controllers/admin/ordersController.js");

router.route("/pending").get(authenticateAdmin, getAllPendingOrders);

router.route("/getorderdetails").post(authenticateAdmin, getOrderDetails);

router.route("/changeorderstatus").post(authenticateAdmin, changeOrderStatus);

router.route("/acceptedorders").get(authenticateAdmin, acceptedOrders);

router.route("/assign/transporter").post(authenticateAdmin, assignTransporter);

router.route("/shippedorders").get(authenticateAdmin, getShippedOrders);

router.route("/deliveredorders").get(authenticateAdmin, getDeliveredOrders);

router.route("/getcanceledorders").get(authenticateAdmin, getCanceledorders);

router
  .route("/getorders/filter")
  .post(authenticateAdmin, getAllOrderByPhoneNumber);

router
  .route("/assign/return/:order_id")
  .post(authenticateAdmin, assignDeliveryBoyForReturn);

router
  .route("/reject/return/:order_id")
  .post(authenticateAdmin, rejectRequestedReturn);

router.route("/view/returned").get(authenticateAdmin, getRequestedReturns);

module.exports = router;
