const { Op } = require("sequelize");
const cron = require('node-cron');
const uniqid = require('uniqid');

const db = require("../models");

const Customers = db.CustomerModel
const Order = db.OrderModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;
const WalletService = require('../services/walletService');





const cashback_job = async () => {

    try {
        let walletService = new WalletService();

        const AllCustomers = await Customers.findAll({});

        const list_user = AllCustomers.map(async (currentUser) => {
            // console.log("===============>", currentUser.cust_name);
            const all_orders = await Order.findAll({
                where: {
                    cust_no: currentUser.cust_no,
                    // status: "Delivered",
                    cashback_amount: { [Op.ne]: null }
                }
            });

            await all_orders.map(async (current_order) => {
                if (current_order.dataValues.cashback_processed == null) // which cashback is not processed
                {
                    console.log("Cashback amount credited=>", current_order.dataValues.cust_no);

                    let cust_no = current_order.dataValues.cust_no;
                    let cashback_amount = current_order.dataValues.cashback_amount;
                    let order_id = current_order.dataValues.order_id;

                    // credit cashback
                    await walletService.creditAmount(cashback_amount, cust_no, "Cashback added for order-" + order_id);

                    // mark as cashback processed
                    await Order.update(
                        {
                            cashback_processed: 1
                        },
                        {
                            where: {
                                order_id: order_id,
                                cust_no: cust_no,
                            }
                        })
                }

            })

        })

    }
    catch (err) {
        console.log("CASHBACK CRON JOB ERROR=>", err);
    }
}


cashback_job();
// job();
// module.exports = refferal_job;