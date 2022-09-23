const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const { downloadInvoice, getOriginalUrl } = require("../controllers/invoiceController");

router.route("/invoice").post(authenticate, downloadInvoice);
router.route("/invoice/:id").get(getOriginalUrl);

module.exports = router;
