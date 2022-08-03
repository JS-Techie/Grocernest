const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin")

const {
    checkWalletDetails,
    creditAmountToWallet,
    debitAmountFromWallet
} = require("../../controllers/admin/walletController.js");

router.route('/check/details/:cust_no').get(authenticateAdmin, checkWalletDetails);

router.route('/credit/amount').post(authenticateAdmin, creditAmountToWallet);

router.route('/debit/amount').post(authenticateAdmin, debitAmountFromWallet);



module.exports = router;