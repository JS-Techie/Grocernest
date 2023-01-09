const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentication");

const {
  getAllTransactionsOfUser,
  getBalanceOfUser,
  getAllSpecialTransactionsOfUser,
} = require("../controllers/walletController.js");

// Authenticated routes - User cannot view anything about wallet without having logged in

router.route("/view/balance").get(authenticate, getBalanceOfUser);
router.route("/view/transactions").get(authenticate, getAllTransactionsOfUser);
router
  .route("/view/special/transactions")
  .get(authenticate, getAllSpecialTransactionsOfUser);

module.exports = router;
