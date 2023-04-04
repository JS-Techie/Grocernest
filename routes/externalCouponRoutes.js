const router = require("express").Router()

const authenticate = require("../middleware/authenticateUser")

const {searchTotalPurchaseController} = require("../controllers/externalCouponController");


router.route("/external").post(searchTotalPurchaseController);


module.exports = router;