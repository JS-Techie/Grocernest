const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const{offerForItem, offerForItemBuyNow} = require("../controllers/offerController")

router.route("/item").post(authenticate, offerForItem)
router.route("/item/buy").post(authenticate, offerForItemBuyNow)

module.exports = router;