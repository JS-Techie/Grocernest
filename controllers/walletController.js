const { sequelize, Sequelize } = require("../services/dbSetupService");
const db = require('../models');

const Wallet = db.WalletModel
const WalletTransaction = db.WalletTransactionModel;

// Find all the transactions of particular customer and send it
const getAllTransactionsOfUser = async (req, res, next) => {

    let customer_no = req.query.cust_no;
    console.log("==>> Get all the transactions of", customer_no);


    Wallet.findAll({
        include: [{
            model: WalletTransaction, attributes: ['wallet_id'],
            where: {
                cust_no: customer_no,

            }
        }]
    }).then((res1) => {
        res.send(res1);
    }).catch((eee) => {
        console.log("error is=========>>>>>>", eee);
    })






    // Wallet.findAll({
    //     attributes: ['wallet_id'],
    //     where: { cust_no: customer_no }
    // }).then((dbRes) => {

    //     WalletTransaction.findAll({
    //         where: {
    //             wallet_id: dbRes[0].wallet_id
    //         }
    //     }).then((dbRes) => {
    //         // console.log(dbRes);
    //         res.send({
    //             success: true,
    //             data: dbRes,
    //             message: ""
    //         })
    //     }).catch((error) => {
    //         console.log(error);
    //         res.send({
    //             success: false,
    //             data: "",
    //             message: ""
    //         })
    //     })
    // }).catch((error) => {
    //     console.log(error);
    //     res.send({
    //         success: false,
    //         data: "",
    //         message: ""
    //     })
    // })
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
        console.log(error);
    })
}

module.exports = {
    getAllTransactionsOfUser,
    getBalanceOfUser
}

