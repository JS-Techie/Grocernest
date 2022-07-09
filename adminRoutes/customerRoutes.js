const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/authenticateAdmin")

const {
    getCustomerList
} = require("../adminControllers/customerController.js");

router.route('/get/customer/list/:phno').get(authenticateAdmin, getCustomerList);
router.route('/get/customer/list').get(authenticateAdmin, getCustomerList);



module.exports = router;