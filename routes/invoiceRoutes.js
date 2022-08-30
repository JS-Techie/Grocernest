const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const { downloadInvoice } = require("../controllers/invoiceController");

router.route("/invoice").post(authenticate,downloadInvoice);

module.exports = router;
