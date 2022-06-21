const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    getCode,
    getMembers
} = require("../controllers/referralController")

router.route('/code').get(authenticate, getCode)
router.route('/members').get(authenticate,getMembers)




module.exports = router;