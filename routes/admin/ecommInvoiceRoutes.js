const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticateAdmin");

const {
  downloadEcommInvoice,
} = require("../../controllers/admin/invoiceController");

router.route("/download").post(downloadEcommInvoice);

// authenticate

module.exports = router;
