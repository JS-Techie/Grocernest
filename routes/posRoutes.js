const express =require("express");
const router = express.Router();

const{sendInvoice} = require("../controllers/posController");

router.route("/pos/invoice").post(sendInvoice);

module.exports = router;
