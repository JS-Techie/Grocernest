const router = require("express").Router();

const {
  addWalletBalance,
  checkBatchNo,
} = require("../controllers/adhocController");

router.route("/itemsp/wallet/add").post(addWalletBalance);
router.route("/duplicate/batch").post(checkBatchNo);

module.exports = router;
