const express = require("express");
const router = express.Router();

const {
  fetchCustomerReport,
} = require("../../controllers/admin/adminReportController");

router.route("/customer").post(fetchCustomerReport);

// authenticate

module.exports = router;
