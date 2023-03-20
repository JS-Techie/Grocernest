const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin")

const {
    checkSpecialWalletDetails,
    // creditAmountToWallet,
    // debitAmountFromWallet
} = require("../../controllers/admin/walletSpecialController");

router.route('/check/details/:cust_no').get(authenticateAdmin, checkSpecialWalletDetails);

// router.route('/credit/amount').post(authenticateAdmin, creditAmountToWallet);

// router.route('/debit/amount').post(authenticateAdmin, debitAmountFromWallet);



module.exports = router;