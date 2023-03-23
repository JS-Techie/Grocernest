const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const{returnItemShowController} = require("../controllers/returnItemShowController")

router.route("/itemShow/:orderId").post(authenticate, returnItemShowController)

module.exports = router;