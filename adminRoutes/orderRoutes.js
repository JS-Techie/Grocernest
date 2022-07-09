const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/authenticateAdmin")

const {
    getAllPendingOrders,
    getOrderDetails,
    changeOrderStatus,
    acceptedOrders
} = require("../adminControllers/ordersController.js");

router.route('/pending').get(authenticateAdmin, getAllPendingOrders);

router.route('/getorderdetails').post(authenticateAdmin, getOrderDetails);

router.route('/changeorderstatus').post(authenticateAdmin, changeOrderStatus);

router.route('/acceptedorders').get(authenticateAdmin, acceptedOrders);


module.exports = router;