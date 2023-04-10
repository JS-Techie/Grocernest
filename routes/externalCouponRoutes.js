const router = require("express").Router()

const authenticate = require("../middleware/authenticateUser")

const {searchTotalPurchaseController, generateCoupon, viewCoupon} = require("../controllers/externalCouponController");


router.route("/external").post(searchTotalPurchaseController);
router.route("/external/generate").post(generateCoupon);
router.route("/external/view").post(viewCoupon);


module.exports = router;