const express = require("express")
const router = express.Router();

const admin = require("../middleware/authenticateAdmin");

const {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon
} = require("../adminControllers/couponController")

router.route("/view/all").get(admin,getAllCoupons);
router.route("/view/:id").get(admin,getCouponById);
router.route("/create").post(admin,createCoupon);
router.route("/update/:id").patch(admin,updateCoupon);
router.route("/delete/:id").delete(admin,deleteCoupon);

module.exports = router;