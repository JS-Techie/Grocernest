const cc = require("coupon-code");
const db = require("../../models");
const uniq = require("uniqid");
const CouponToCustomer = db.CouponToCustomerModel;
const Customer = db.CustomerModel;
const CustomerToCouponMapping = db.CustomerToCouponMappingModel;

const createCouponToCustomer = async (req, res, next) => {
    const {
        coupon_name,
        coupon_desc,
        amount_of_discount,
        duration,
    } = req.body;

    const { user_id } = req;

    try {

        if (coupon_name == "" || amount_of_discount == "" || amount_of_discount <= 0 || duration == "" || duration <= 0) {
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



        // check that coupon code is available already or not
        const couponAvailable = await CouponToCustomer.findAll({
            where: {
                coupon_name
            }
        });

        if (couponAvailable.length > 0) {
            return res.status(400).send({
                success: false,
                data: [],
                message: "Coupon code already exists! try with a different name.",
            });
        }

        // coupon code is not already taken, so proceed..
        let new_id = uniq()
        const newCoupon = await CouponToCustomer.create({
            id: new_id,
            coupon_name,
            coupon_desc,
            amount_of_discount,
            duration,
            created_by: user_id,
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

    const { id, coupon_desc, amount_of_discount, duration } = req.body;
    const { user_id } = req;

    if (amount_of_discount <= 0 || amount_of_discount == "" || duration == "" || duration <= 0) {
        return res.status(400).send({
            success: false,
            data: [],
            message: "Please enter all mandatory field and put valid data",
        });
    }

    try {
        const updatedCoupon = CouponToCustomer.update(
            {
                coupon_desc,
                amount_of_discount,
                duration,
                updated_at: new Date().getTime(),
                updated_by: user_id
            },
            { where: { id } }
        )
        return res.status(200).send({
            success: true,
            data: updatedCoupon,
            message: "The coupon to customer edited successfully",
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

const deleteCouponToCustomer = async (req, res, next) => {
    const { id } = req.body;

    try {
        const deleted = await CouponToCustomer.destroy({
            where: { id },
        });

        return res.status(200).send({
            success: true,
            data: deleted,
            message: "The coupon to customer deleted successfully",
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



const mapCouponToCustomer = async (req, res, next) => {
    const { cust_no, coupon_id, coupon_name } = req.body;
    const { user_id } = req;

    try {

        // check coupon exist or not
        let couponExist = await CouponToCustomer.findAll({
            where: {
                id: coupon_id,
            }
        })

        if (couponExist.length < 1) {
            return res.status(400).send({
                success: false,
                data: "",
                message: "Coupon/Coupon ID does not exist.",
            });
        }

        // check customer exist or not
        let customerExist = await Customer.findAll({
            where: {
                cust_no
            }
        })

        if (customerExist.length < 1) {
            return res.status(400).send({
                success: false,
                data: "",
                message: "Customer/Customer ID does not exist.",
            });
        }

        // everything is valid, now create the map
        const mapCustomerToCouponData = CustomerToCouponMapping.create({
            cust_id: cust_no,
            coupon_id,
            coupon_name,
            assignment_date: new Date().getTime(),
            created_by: user_id
        })

        return res.status(200).send({
            success: true,
            data: mapCustomerToCouponData,
            message: "User mapped to the coupon successfully!",
        });
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Something went wrong while mapping user to the coupon.",
        });
    }
}
module.exports = {
    createCouponToCustomer,
    displayCouponToCustomer,
    updateCouponToCustomer,
    deleteCouponToCustomer,

    mapCouponToCustomer
};
