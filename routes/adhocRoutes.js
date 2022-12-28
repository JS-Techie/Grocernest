const router = require("express").Router();

const {
  addWalletBalance,
  checkBatchNo,
  migrateCustomers,
} = require("../controllers/adhocController");

router.route("/itemsp/wallet/add").post(addWalletBalance);
router.route("/duplicate/batch").post(checkBatchNo);
router.route("/create/wallet").post(migrateCustomers);

module.exports = router;
