const db = require('../models');

const Wallet = db.WalletModel
const WalletTransaction = db.WalletTransactionModel;

// Find all the transactions of particular customer and send it
const getAllTransactionsOfUser = async (req, res, next) => {

    let customer_no = req.query.cust_no;
    console.log("==>> Get all the transactions of", customer_no);

    Wallet.findAll({
        include: [{
            model: WalletTransaction,
        }],
        where: {
            cust_no: customer_no,
        }
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData,
            message: "Successfully fetched Transaction Data",
        });
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching transaction from database",
        });
    })
}

// Get Wallet Balance of a customer
const getBalanceOfUser = async (req, res, next) => {

    let customer_no = req.query.cust_no;
    console.log("==>> Get Wallet balance of the user", customer_no);

    Wallet.findAll({
        where: { cust_no: customer_no }
    }).then((dbRes) => {
        res.send({
            success: true,
            data: dbRes,
            message: ""
        })
    }).catch((error) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching balance from database",
        });
    })
}

module.exports = {
    getAllTransactionsOfUser,
    getBalanceOfUser
}

