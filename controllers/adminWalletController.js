const db = require('../models');

const Wallet = db.WalletModel
const WalletTransaction = db.WalletTransactionModel;


// View the wallet history and current balance for a customer
const getCustomerWalletDetails = async (req, res, next) => {
    let cust_no = req.params.custno
    console.log(cust_no);

}


module.exports = {
    getCustomerWalletDetails
}
