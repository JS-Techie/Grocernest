const cc = require("coupon-code");
const db = require("../../models");
const uniq = require("uniqid");
const CouponToCustomer = db.CouponToCustomerModel;

const createCouponToCustomer = async (req, res, next) => {
    const {
        coupon_name,
        coupon_desc,
        amount_of_discount,
        duration,
    } = req.body;

    console.log(coupon_name,
        coupon_desc,
        amount_of_discount,
        duration,)
    if (coupon_name == "" && amount_of_discount == "" && duration == "" && duration <= 0) {
        return res.status(400).send({
            success: false,
            data: [],
            message: "Please enter all mandatory field and put valid data",
        });
    }

    if (amount_of_discount === 0) {
        return res.status(400).send({
            success: false,
            data: [],
            message: "Please enter an amount, it cannot be zero",
        });
    }

    try {
        let new_id = uniq()
        const newCoupon = await CouponToCustomer.create({
            id: new_id,
            coupon_name,
            coupon_desc,
            amount_of_discount,
            duration,
            created_by: 1,
        });

        return res.status(201).send({
            success: true,
            data: newCoupon,
            message: "New coupon to customer successfully created",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Something went wrong, please check data field",
        });
    }
};

const displayCouponToCustomer = async (req, res, next) => {

    try {
        const allCoupons = await CouponToCustomer.findAll();

        return res.status(200).send({
            success: true,
            data: allCoupons,
            message: "All coupon to customer fetched successfully",
        });
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Something went wrong.",
        });
    }
}

const updateCouponToCustomer = async (req, res, next) => {

    try {

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Something went wrong.",
        });
    }
}

const deleteCouponToCustomer = async (req, res, next) => {

    try {

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Something went wrong.",
        });
    }
}



module.exports = {
    createCouponToCustomer,
    displayCouponToCustomer,
    updateCouponToCustomer,
    deleteCouponToCustomer
};
