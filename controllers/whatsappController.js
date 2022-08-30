
const { optIn, optOut } = require('../services/whatsapp/optInOut');

const db = require('../models');
// const { sequelize } = require("./models");

const Customer = db.CustomerModel;

const optInUser = async (req, res, next) => {

    try {
        let mobile_number = req.body.mobile_number;
        if (!mobile_number)
            return res.status(400).send({
                success: true,
                data: "",
                message: "mobile number not present",
            });

        const response = await Promise.resolve(optIn("91" + mobile_number));

        const cust_update = await Customer.update({
            opt_in: 1
        }, {
            where: {
                contact_no: mobile_number
            }
        })

        if (response == 202)
            return res.status(200).send({
                success: true,
                data: "",
                message: "whatsapp number opt in successfully",
            });

        return res.status(400).send({
            success: false,
            data: "",
            message: "error occured while opt in whatsapp number",
        });

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "error occured while opt in whatsapp number",
        });
    }
};

const optOutUser = async (req, res, next) => {
    try {
        let mobile_number = req.body.mobile_number;
        if (!mobile_number)
            return res.status(400).send({
                success: true,
                data: "",
                message: "mobile number not present",
            });

        const cust_update = await Customer.update({
            opt_in: null
        }, {
            where: {
                contact_no: mobile_number
            }
        })


        let response = await Promise.resolve(optOut("91" + mobile_number));
        if (response == 202)
            return res.status(200).send({
                success: true,
                data: "",
                message: "whatsapp number opt out successfully",
            });

        return res.status(400).send({
            success: true,
            data: "",
            message: "error occured while opt out whatsapp number",
        });

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "error occured while opt out whatsapp number",
        });
    }
};

module.exports = {
    optInUser,
    optOutUser
};
