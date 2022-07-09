const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    getAllGifts,
    applyGifts
}  = require("../controllers/giftController")

router.route('/all').get(authenticate, getAllGifts)
router.route('/apply').post(authenticate,applyGifts)



module.exports = router;