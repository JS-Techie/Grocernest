const express = require("express")
const router = express.Router();
const authenticate = require("../middleware/authentication");

// import authenticate from "../middleware/authentication.js";

const {
    getAllTransactionsOfUser,
    getBalanceOfUser
} = require("../controllers/walletController.js")


const { getCustomerWalletDetails } = require("../controllers/adminWalletController.js");

// Authenticated routes - User cannot view anything about wallet without having logged in

router.route("/view/balance").get(authenticate, getBalanceOfUser);
router.route("/view/transactions").get(authenticate, getAllTransactionsOfUser);

// Admin routes
// View the wallet history and current balance for a customer
router.route("/customer/:custno").get(authenticate, getCustomerWalletDetails);

module.exports = router;

