const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/authenticateAdmin")

const {
    getAllPendingOrders,
} = require("../adminControllers/ordersController.js");

router.route('/pending').get(authenticateAdmin, getAllPendingOrders);


module.exports = router;