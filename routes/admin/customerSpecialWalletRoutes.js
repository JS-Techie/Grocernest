const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin")

const {
    getSpecialWalletCustomerList
} = require("../../controllers/admin/customerSpecialWalletController");


router.route('/get/specialwallet/customer/list/:phno').get(authenticateAdmin, getSpecialWalletCustomerList);
router.route('/get/specialwallet/customer/list').get(authenticateAdmin, getSpecialWalletCustomerList);



module.exports = router;