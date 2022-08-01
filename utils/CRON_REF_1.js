const { Op } = require("sequelize");
const cron = require('node-cron');
const uniqid = require('uniqid');

const db = require("../models");

const Customers = db.CustomerModel
const Order = db.OrderModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;
const refferal_job = () => {
    cron.schedule("30 23 * * *", () => {
        console.log("Running scheduled CRON-JOB.....");
        job();

    })
}



const job = async () => {

    try {

        let reward_amount = 100;
        const AllCustomers = await Customers.findAll({
            where: {
                [Op.and]: [{

                    referred_by: {
                        [Op.not]: "",
                    }
                },
                {
                    reward_recieved: null
                }
                ]

            }
        });

        let first_purchase_referred_user = [];
        const list_user = AllCustomers.map(async (currentUser) => {

            // console.log("===============>", currentUser.cust_name);

            const No_of_Order = await Order.count({
                where: {
                    cust_no: currentUser.cust_no,
                    status: "Delivered"
                }
            });
            if (No_of_Order >= 1) {
                first_purchase_referred_user.push(currentUser.cust_no);
                console.log(currentUser.cust_no);

                // wallet update of me
                const user_wallet = await Wallet.findOne({
                    where: {
                        cust_no: currentUser.cust_no
                    }
                })
                // console.log("user_wallet of=>", currentUser.cust_no, "==>>>", user_wallet)

                const wallet = await Wallet.update({
                    balance: user_wallet.balance + reward_amount
                },
                    { where: { cust_no: currentUser.cust_no } }
                )

                const wallet_transaction = await Wallet_Transaction.create({
                    wallet_id: user_wallet.wallet_id,
                    transaction_id: uniqid(),
                    transaction_type: 'C',
                    transaction_amount: reward_amount,
                    transaction_details: "1st Purchase after getting referred",
                    created_by: 2
                })

                // wallet update of who referred me

                const user_wallet_2 = await Wallet.findOne({
                    where: {
                        cust_no: currentUser.referred_by
                    }
                })
                console.log("user_wallet_2 of=>", currentUser.cust_no, "==>>>", currentUser.referred_by)

                const wallet_2 = await Wallet.update({
                    balance: user_wallet_2.balance + reward_amount
                },
                    { where: { cust_no: currentUser.referred_by } }
                )

                const wallet_transaction_2 = await Wallet_Transaction.create({
                    wallet_id: user_wallet_2.wallet_id,
                    transaction_id: uniqid(),
                    transaction_type: 'C',
                    transaction_amount: reward_amount,
                    transaction_details: "Referral reward",
                    created_by: 2
                })

                // mark reward_recieved as Yes
                const reward_recieved = await Customers.update({
                    reward_recieved: "Yes"
                },
                    {
                        where: {
                            cust_no: currentUser.cust_no
                        }
                    }
                )
            };
        })

    }
    catch (err) {
        console.log("CRON ERROR=>", err);
    }
}



// job();
module.exports = refferal_job;