const router = require("express").Router();

const {
  addWalletBalance,
  checkBatchNo,
  addSpecialWalletBalance,
} = require("../controllers/adhocController");

router.route("/itemsp/wallet/add").post(addWalletBalance);
// router.route("/special/wallet/add/money").post(addSpecialWalletBalance);
router.route("/duplicate/batch").post(checkBatchNo);

module.exports = router;
