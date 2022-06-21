const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const {
    getAllAvailableCoupons,
    validateCoupon
} = require('../controllers/couponsController')

router.route('/available').get(authenticate,getAllAvailableCoupons)
router.route('/validate').post(authenticate,validateCoupon)


module.exports = router;