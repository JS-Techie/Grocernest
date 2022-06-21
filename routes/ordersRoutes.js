const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    getAllOrders,
    getOrderByOrderId,
    cancelOrder,
    returnOrder,
    trackOrder
} = require("../controllers/ordersController")


router.route('/all').get(authenticate,getAllOrders)
router.route('/:orderId').get(authenticate,getOrderByOrderId)
router.route('/cancel').post(authenticate,cancelOrder)
router.route('/return').post(authenticate,returnOrder)
router.route('/:orderId/tracking').get(authenticate,trackOrder)



module.exports = router;