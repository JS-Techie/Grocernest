const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const{offerForItem} = require("../controllers/offerController")

router.route("/item").post(authenticate, offerForItem)

module.exports = router;