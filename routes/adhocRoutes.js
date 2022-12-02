const router = require("express").Router();

const { addWalletBalance } = require("../controllers/adhocController");

router.route("/itemsp/wallet/add").post(addWalletBalance);

module.exports = router;
