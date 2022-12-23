const express = require("express")
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
    createCouponToCustomer,
    displayCouponToCustomer,
    updateCouponToCustomer,
    deleteCouponToCustomer,
    mapCouponToCustomer,
    applyCoupon,
    displayMappedCouponToCustomer,
    applicableCouponForACustomer
} = require("../../controllers/admin/couponToCustomerController");

router.route("/create").post(admin, createCouponToCustomer); //create
router.route("/display").get(admin, displayCouponToCustomer); //read
router.route("/update").post(admin, updateCouponToCustomer); //update
router.route("/delete").post(admin, deleteCouponToCustomer); //delete

router.route("/map").post(admin, mapCouponToCustomer); //map coupon to customer
router.route("/map/display").get(admin, displayMappedCouponToCustomer); //map coupon to customer


router.route("/applicable/coupons").post(admin, applicableCouponForACustomer);


router.route("/apply/coupon").post(admin, applyCoupon); //apply coupon to customer //not done yet




module.exports = router;