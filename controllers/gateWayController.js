const { sequelize } = require("../models");
const db = require("../models");
const GatewayTransaction = db.GatewayTransactionModel;
const uniqid = require("uniqid");

const getGatewayID = async (req, res, next) => {

    const currentCustomer = req.cust_no;
    const gatewayTransactionID = uniqid();

    try {
        const response = await GatewayTransaction.create({
            transaction_id: gatewayTransactionID,
            cust_no: currentCustomer,
            status: "Valid",
            created_by: 2
        });
        return res.status(200).send({
            success: true,
            data: {
                gateway_transaction_id: gatewayTransactionID,
                status: "Valid"
            },
            message: "Gateway transaction id generated successfully",
        });
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Could not generate gateway transaction id",
        });
    }
};

const validateGatewayID = async (req, res, next) => {
    const transaction_id = req.body.gateway_transaction_id;
    const currentCustomer = req.cust_no;

    try {
        const response = await GatewayTransaction.findOne({
            where: {
                transaction_id: transaction_id,
                cust_no: currentCustomer,
            }
        });

        return res.status(200).send({
            success: true,
            data: {
                transaction_id: transaction_id,
                status: response.status
            },
            message: "Gateway transaction status fetched successfully",
        });
    }

    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Could not fetch status of this gateway transaction id",
        });
    }
};

const expireGatewayID = async (req, res, next) => {
    const transaction_id = req.body.gateway_transaction_id;
    const currentCustomer = req.cust_no;

    try {
        const response = await GatewayTransaction.update(
            {
                status: "Expired"
            },
            {
                where: {
                    transaction_id: transaction_id,
                    cust_no: currentCustomer,
                }
            }
        );

        return res.status(200).send({
            success: true,
            data: {
                transaction_id: transaction_id,
                status: "Expired"
            },
            message: "Gateway transaction Expired successfully",
        });
    }

    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Could not set Expire status of this gateway transaction id",
        });
    }

};


module.exports = {
    getGatewayID,
    validateGatewayID,
    expireGatewayID
};
