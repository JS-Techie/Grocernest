const db = require("../models");
const Customer = db.CustomerModel;

const getCode = async (req, res, next) => {
    //Get current user from JWT
    const currentUser = req.cust_no;

    console.log("get code", currentUser);
    Customer.findOne({
        attributes: ['referral_code'],
        where: {
            cust_no: currentUser,
        }
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData,
            message: "Successfully fetched referral code",
        });
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching referral code",
        });
    })
}

const getMembers = async (req, res, next) => {
    //Get current user from JWT
    const currentUser = req.cust_no;

    Customer.findAll({
        attributes: ["cust_no", "cust_name", "email", "contact_no"],
        where: {
            referred_by: currentUser,
        }
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData,
            message: "Successfully fetched referred members",
        });
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching referred members",
        });
    })
}

module.exports = {
    getCode,
    getMembers
}