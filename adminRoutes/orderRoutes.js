const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/authenticateAdmin")

const {
    getAllPendingOrders,
    getOrderDetails
} = require("../adminControllers/ordersController.js");

router.route('/pending').get(authenticateAdmin, getAllPendingOrders);

router.route('/getorderdetails').post(authenticateAdmin, getOrderDetails);


module.exports = router;