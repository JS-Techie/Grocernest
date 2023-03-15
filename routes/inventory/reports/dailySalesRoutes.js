const express = require("express");
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin");

const {
  invoiceRaised,
  paymentSummary,
} = require("../../../controllers/inventory/reports/dailySalesController");

router
  .route("/secure/report/fetchInvoicesRaised")
  .post(authenticate, invoiceRaised);
router
  .route("/secure/report/fetchPaymentSummary")
  .post(authenticate, paymentSummary);

module.exports = router;
