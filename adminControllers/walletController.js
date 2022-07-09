const db = require('../models');
const { sequelize } = require("../models");

const Wallet = db.WalletModel
const WalletTransaction = db.WalletTransactionModel;

const checkWalletDetails = async (req, res, next) => {
    let cust_no = req.params.cust_no

    Wallet.findAll({
        include: [{
            model: WalletTransaction,
        }],
        where: {
            cust_no: cust_no,
        }
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData[0],
            message: "Successfully fetched Wallet and Transaction Data",
        });
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching wallet and transaction from database",
        });
    })
}

const creditAmountToWallet = async (req, res, next) => {
    let amount = req.body.amount;
    let cust_no = req.body.cust_no;

    try {
        const [results, metadata] =
            await sequelize.query(`
            UPDATE t_wallet
            SET balance = (select balance from t_wallet where cust_no="${cust_no}")+${amount}
            WHERE cust_no = "${cust_no}"
          `);

        const [results2, metadata2] =
            await sequelize.query(`
            select balance from t_wallet where cust_no="${cust_no}"
          `);

        return res.status(200).send({
            success: true,
            data: results2[0],
            message: "Amount successfully added to the wallet",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error while adding amount to the wallet",
        });
    }
}

const debitAmountFromWallet = async (req, res, next) => {
    let amount = req.body.amount;
    let cust_no = req.body.cust_no;

    try {
        const [results, metadata] =
            await sequelize.query(`
            UPDATE t_wallet
            SET balance = (select balance from t_wallet where cust_no="${cust_no}")-${amount}
            WHERE cust_no = "${cust_no}"
          `);

        const [results2, metadata2] =
            await sequelize.query(`
            select balance from t_wallet where cust_no="${cust_no}"
          `);

        return res.status(200).send({
            success: true,
            data: results2[0],
            message: "Amount successfully debited from the wallet",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error while debit amount from the wallet",
        });
    }
}

module.exports = {
    checkWalletDetails,
    creditAmountToWallet,
    debitAmountFromWallet
}