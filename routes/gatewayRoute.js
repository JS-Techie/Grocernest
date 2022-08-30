const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const {
    getGatewayID,
    validateGatewayID,
    expireGatewayID
} = require("../controllers/gateWayController");

router.route('/getid').get(authenticate, getGatewayID)
router.route('/validateid').post(authenticate, validateGatewayID)
router.route('/setexpire').post(authenticate, expireGatewayID)

module.exports = router;