const express = require("express")
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
    createCouponToCustomer,
    displayCouponToCustomer,
    updateCouponToCustomer,
    deleteCouponToCustomer
} = require("../../controllers/admin/couponToCustomerController");

router.route("/create").post(admin, createCouponToCustomer); //create
router.route("/display").get(admin, displayCouponToCustomer); //read
router.route("/update").post(admin, updateCouponToCustomer); //update
router.route("/delete").post(admin, deleteCouponToCustomer); //delete


module.exports = router;