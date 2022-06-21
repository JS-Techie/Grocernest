const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    getAllGifts,
    applyGift
}  = require("../controllers/giftController")

router.route('/all').get(authenticate,getAllGifts)
router.route('/apply').post(authenticate,applyGift)


module.exports = router;