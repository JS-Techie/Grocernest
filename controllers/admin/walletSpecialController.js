const db = require('../../models');
const { sequelize } = require("../../models");
// const uniqid = require('uniqid');
// const WalletService = require('../../services/walletService');


const checkSpecialWalletDetails = async (req, res, next) => {

    let {cust_no} = req.params;

    try {

        const [transactions, metadata] = await sequelize.query(`select t_special_wallet_transaction.* from t_special_wallet_transaction inner join
        t_wallet on t_special_wallet_transaction.wallet_id=t_wallet.wallet_id where t_wallet.cust_no='${cust_no}' order by 
        t_special_wallet_transaction.created_at desc`)


        // console.log("the transactions are ::::::::::  ", transactions)
        
        //Check for the length of the array and send apt responses

        if(transactions.length()===0){
            return res.status(201).send({
                success: true,
                data:[],
                message:"No Transactions yet."
            })
        }

        return res.status(201).send({
            success: true,
            data: transactions,
            message: "Successfully fetched Special Wallet Transaction Data",
        });
    }
    catch (err) {
        return res.status(400).send({
            success: false,
            data: err.message,
            message: "Error while fetching wallet and transaction from database",
        });
    }

    // const creditAmountToWallet = async (req, res, next) => {
    //     let amount = req.body.amount;
    //     let cust_no = req.body.cust_no;
    //     let details = req.body.details;

    //     let walletService = new WalletService();
    //     let result = await walletService.creditAmount(amount, cust_no, details);

    //     if (result.success == true) {
    //         return res.status(200).send({
    //             success: true,
    //             data: result.data,
    //             message: result.message,
    //         });
    //     }
    //     return res.status(400).send({
    //         success: false,
    //         data: result.data,
    //         message: result.message,
    //     });
    // }

    // const debitAmountFromWallet = async (req, res, next) => {
    //     let amount = req.body.amount;
    //     let cust_no = req.body.cust_no;

    //     let details = req.body.details
    //     let transaction_id = uniqid();

    //     try {
    //         if (amount > 0) {
    //             const [results, metadata] =
    //                 await sequelize.query(`
    //                 UPDATE t_wallet
    //                 SET balance = (select balance from t_wallet where cust_no="${cust_no}")-${amount}
    //                 WHERE cust_no = "${cust_no}"
    //                 `);

    //             const [results2, metadata2] =
    //                 await sequelize.query(`
    //                 INSERT INTO t_wallet_transaction
    //                 (wallet_id, transaction_id, transaction_type, transaction_amount, transaction_details, transaction_date_time, created_by, updated_by, created_at, updated_at)
    //                 VALUES((
    //                 select wallet_id from t_wallet where cust_no="${cust_no}"
    //                 ), "${transaction_id}", "D", ${amount}, "${details}", current_timestamp(), 2, NULL, current_timestamp(), current_timestamp()); 
    //                 `);

    //             const [results3, metadata3] =
    //                 await sequelize.query(`
    //                 select balance from t_wallet where cust_no="${cust_no}"
    //                 `);
    //             return res.status(200).send({
    //                 success: true,
    //                 data: results3[0],
    //                 message: "Amount successfully debited from the wallet",
    //             });
    //         }

    //     } catch (error) {
    //         return res.status(400).send({
    //             success: false,
    //             data: error.message,
    //             message:
    //                 "Error while debit amount from the wallet",
    //         });
    //     }
    // }
}
module.exports = {
    checkSpecialWalletDetails
    // creditAmountToWallet,
    // debitAmountFromWallet
}