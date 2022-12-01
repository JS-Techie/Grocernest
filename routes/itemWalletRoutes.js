const router = require("express").Router();

const authenticate = require("../middleware/authentication");

const {
  getWalletBalance,
  getTransactionHistory,
} = require("../controllers/itemWalletController");

router.route("/wallet/view").get(authenticate, getWalletBalance);
router.route("/wallet/history").get(authenticate, getTransactionHistory);

module.exports = router;
