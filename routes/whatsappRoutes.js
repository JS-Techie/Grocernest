const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const {
    optInUser,
    optOutUser
} = require("../controllers/whatsappController")

router.route('/opt/in').post(authenticate, optInUser);
router.route('/opt/out').post(authenticate, optOutUser);


module.exports = router;