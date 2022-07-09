const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/authenticateAdmin")

const {
    getAllPendingOrders,
    getOrderDetails,
    changeOrderStatus,
    acceptedOrders,
    assignTransporter,
    getShippedOrders,
    getDeliveredOrders
} = require("../adminControllers/ordersController.js");

router.route('/pending').get(authenticateAdmin, getAllPendingOrders);

router.route('/getorderdetails').post(authenticateAdmin, getOrderDetails);

router.route('/changeorderstatus').post(authenticateAdmin, changeOrderStatus);

router.route('/acceptedorders').get(authenticateAdmin, acceptedOrders);

router.route('/assign/transporter').post(authenticateAdmin, assignTransporter);

router.route('/shippedorders').get(authenticateAdmin, getShippedOrders);

router.route('/deliveredorders').get(authenticateAdmin, getDeliveredOrders);

module.exports = router;