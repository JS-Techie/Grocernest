const { Op } = require("sequelize");
const cron = require('node-cron');
const uniqid = require('uniqid');

const db = require("../models");

const Customers = db.CustomerModel
const Order = db.OrderModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;





const job = async () => {

    try {

        const AllCustomers = await Customers.findAll({});

        const list_user = AllCustomers.map(async (currentUser) => {

            console.log("===============>", currentUser.cust_name);

            const all_orders = await Order.findAll({
                where: {
                    cust_no: currentUser.cust_no,
                    // status: "Delivered",
                    cashback_amount: { [Op.ne]: null }
                }
            });

            await all_orders.map(async (current_order) => {
                if (current_order.dataValues.cashback_processed == null)
                    console.log(current_order.dataValues);
            })

        })

    }
    catch (err) {
        console.log("CRON ERROR=>", err);
    }
}


job();
// job();
// module.exports = refferal_job;