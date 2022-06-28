const db = require('../models');

const Wallet = db.WalletModel
const WalletTransaction = db.WalletTransactionModel;


// View the wallet history and current balance for a customer
const getCustomerWalletDetails = async (req, res, next) => {
    let cust_no = req.params.custno

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


module.exports = {
    getCustomerWalletDetails
}
