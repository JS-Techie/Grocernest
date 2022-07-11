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
    getDeliveredOrders,
    getCanceledorders,
    getAllOrderByPhoneNumber
} = require("../adminControllers/ordersController.js");

router.route('/pending').get(authenticateAdmin, getAllPendingOrders);

router.route('/getorderdetails').post(authenticateAdmin, getOrderDetails);

router.route('/changeorderstatus').post(authenticateAdmin, changeOrderStatus);

router.route('/acceptedorders').get(authenticateAdmin, acceptedOrders);

router.route('/assign/transporter').post(authenticateAdmin, assignTransporter);

router.route('/shippedorders').get(authenticateAdmin, getShippedOrders);

router.route('/deliveredorders').get(authenticateAdmin, getDeliveredOrders);

router.route('/getcanceledorders').get(authenticateAdmin, getCanceledorders);

router.route('/getorders/phoneno').post(authenticateAdmin, getAllOrderByPhoneNumber);


module.exports = router;