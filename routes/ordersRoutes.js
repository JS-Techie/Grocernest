const express = require("express");
const router = express.Router();



// const authenticate = require("../middleware/authentication")



const{
    getAllOrders,
    getOrderByOrderId,
    cancelOrder,
    returnOrder,
    trackOrder
} = require("../controllers/ordersController")


//Add authenticate middleware to all controllers

router.route('/all').get(getAllOrders)
router.route('/:orderId').get(getOrderByOrderId)
router.route('/cancel').post(cancelOrder)
router.route('/return').post(returnOrder)
router.route('/:orderId/tracking').get(trackOrder)



module.exports = router;