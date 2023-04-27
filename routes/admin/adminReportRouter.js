const express = require("express");
const router = express.Router();

const {
  fetchCustomerReport,
  fetchItemtoCustomerReport
} = require("../../controllers/admin/adminReportController");

router.route("/customer").post(fetchCustomerReport);
router.route("/itemtocustomer").post(fetchItemtoCustomerReport);

// authenticate

module.exports = router;
