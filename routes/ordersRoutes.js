const express = require("express");
const router = express.Router();



const authenticate = require("../middleware/authentication")



const {
    getAllOrders,
    getOrderByOrderId,
    cancelOrder,
    returnOrder,
    trackOrder

} = require("../controllers/ordersController")

const { getOrderStatus } = require("../controllers/adminOrdersController");

//Add authenticate middleware to all controllers

router.route('/all').get(authenticate, getAllOrders)
router.route('/:orderId').get(authenticate, getOrderByOrderId)
router.route('/cancel/:orderId').post(authenticate, cancelOrder)
router.route('/return/:orderId').post(authenticate, returnOrder)
router.route('/:orderId/tracking').get(authenticate, trackOrder)

// Admin routes
router.route('/status/:orderId').get(authenticate, getOrderStatus)

module.exports = router;