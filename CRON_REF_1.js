// ECOMM CASHBACK
require("dotenv").config();
const { Op } = require("sequelize");
const cron = require("node-cron");
const uniqid = require("uniqid");
const db = require("./models");
const Customers = db.CustomerModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;
const WalletService = require("./services/walletService");
const { sendCronReport } = require("./services/whatsapp/whatsappMessages");

const refferal_job = async () => {
  // schedule time is a utc time (11.30pm ist = 6:00pm utc/18:00)
  cron.schedule("0 25 18 * * *", async () => {
    console.log("Running scheduled CRON-JOB.....");

    // referral task
    await job();

    // cashback task
    await cashback_job();
  });
};

const job = async () => {
  try {
    let reward_amount = 20;
    const AllCustomers = await Customers.findAll({
      where: {
        [Op.and]: [
          {
            referred_by: {
              [Op.not]: "",
            },
          },
          {
            reward_recieved: null,
          },
        ],
      },
    });

    let first_purchase_referred_user = [];
    const list_user = AllCustomers.map(async (currentUser) => {
      // console.log("===============>", currentUser.cust_name);

      const No_of_Order = await Order.count({
        where: {
          cust_no: currentUser.cust_no,
          status: "Delivered",
        },
      });
      if (No_of_Order >= 1) {
        first_purchase_referred_user.push(currentUser.cust_no);
        console.log(currentUser.cust_no);

        // wallet update of me
        const user_wallet = await Wallet.findOne({
          where: {
            cust_no: currentUser.cust_no,
          },
        });
        // console.log("user_wallet of=>", currentUser.cust_no, "==>>>", user_wallet)

        const wallet = await Wallet.update(
          {
            balance: user_wallet.balance + reward_amount,
          },
          { where: { cust_no: currentUser.cust_no } }
        );

        const wallet_transaction = await Wallet_Transaction.create({
          wallet_id: user_wallet.wallet_id,
          transaction_id: uniqid(),
          transaction_type: "C",
          transaction_amount: reward_amount,
          transaction_details: "1st Purchase after getting referred",
          created_by: 2,
        });

        // wallet update of who referred me

        const user_wallet_2 = await Wallet.findOne({
          where: {
            cust_no: currentUser.referred_by,
          },
        });
        console.log(
          "user_wallet_2 of=>",
          currentUser.cust_no,
          "==>>>",
          currentUser.referred_by
        );

        const wallet_2 = await Wallet.update(
          {
            balance: user_wallet_2.balance + reward_amount,
          },
          { where: { cust_no: currentUser.referred_by } }
        );

        const wallet_transaction_2 = await Wallet_Transaction.create({
          wallet_id: user_wallet_2.wallet_id,
          transaction_id: uniqid(),
          transaction_type: "C",
          transaction_amount: reward_amount,
          transaction_details: "Referral reward",
          created_by: 2,
        });

        // mark reward_recieved as Yes
        const reward_recieved = await Customers.update(
          {
            reward_recieved: "Yes",
          },
          {
            where: {
              cust_no: currentUser.cust_no,
            },
          }
        );
      }
    });
  } catch (err) {
    console.log("CRON ERROR=>", err);
  }
};

const cashback_job = async () => {
  try {
    let walletService = new WalletService();

    // const AllCustomers = await Customers.findAll({});

    const delivered_orders = await Order.findAll({
      where: {
        status: "Delivered",
        cashback_processed: { [Op.eq]: null },
      },
    });

    delivered_orders.map(async (current_order) => {
      console.log(current_order.cust_no);
      // let currentUser = await Customers.findOne({
      //   where: {
      //     cust_no: current_order.cust_no,
      //   },
      // });

      console.log(current_order.dataValues.cashback_amount);

      // we got currentUser -> so now run the old code as it is

      let cust_no = current_order.dataValues.cust_no;
      let cashback_amount = current_order.dataValues.cashback_amount;
      let order_id = current_order.dataValues.order_id;

      // loop through current order items
      let order_items = await OrderItems.findAll({
        where: {
          order_id: current_order.order_id,
          special_cashback_processed: null,
          cashback_amount: { [Op.gt]: 0 },
          cashback_amount: { [Op.not]: null },
        },
      });

      await order_items.map(async (current_item) => {
        await walletService.creditAmount(
          current_item.cashback_amount,
          cust_no,
          "Cashback added for order-" + order_id
        );

        await OrderItems.update(
          {
            cashback_processed: 1,
          },
          {
            where: {
              order_id: order_id,
              item_id: current_item.item_id,
            },
          }
        );
      });
      // credit cashback

      // mark as cashback processed
      // UNCOMMENT THISS........
      await Order.update(
        {
          cashback_processed: 1,
        },
        {
          where: {
            order_id: order_id,
            cust_no: cust_no,
          },
        }
      );
      // }

      // till this
    });

    //old CODE===============
    // const list_user = AllCustomers.map(async (currentUser) => {
    //   const all_orders = await Order.findAll({
    //     where: {
    //       cust_no: currentUser.cust_no,
    //       status: "Delivered",
    //       cashback_processed: { [Op.eq]: null },
    //       // special_cashback_processed: { [Op.eq]: null },
    //     },
    //   });

    //   await all_orders.map(async (current_order) => {
    //     // if (current_order.dataValues.cashback_processed == null) {
    //     // which cashback is not processed
    //     // console.log(
    //     //   "Cashback amount credited=>",
    //     //   current_order.dataValues.cust_no
    //     // );

    //     let cust_no = current_order.dataValues.cust_no;
    //     let cashback_amount = current_order.dataValues.cashback_amount;
    //     let order_id = current_order.dataValues.order_id;

    //     // loop through current order items
    //     let order_items = await OrderItems.findAll({
    //       where: {
    //         order_id: current_order.order_id,
    //         special_cashback_processed: null,
    //         cashback_amount: { [Op.gt]: 0 },
    //         cashback_amount: { [Op.not]: null },
    //       },
    //     });

    //     await order_items.map(async (current_item) => {
    //       await walletService.creditAmount(
    //         current_item.cashback_amount,
    //         cust_no,
    //         "Cashback added for order-" + order_id
    //       );

    //       await OrderItems.update(
    //         {
    //           cashback_processed: 1,
    //         },
    //         {
    //           where: {
    //             order_id: order_id,
    //             item_id: current_item.item_id,
    //           },
    //         }
    //       );
    //     });
    //     // credit cashback

    //     // mark as cashback processed
    //     // UNCOMMENT THISS........
    //     await Order.update(
    //       {
    //         cashback_processed: 1,
    //       },
    //       {
    //         where: {
    //           order_id: order_id,
    //           cust_no: cust_no,
    //         },
    //       }
    //     );
    //     // }
    //   });
    // });
    // sendCronReport("cron_ref_1_S");
  } catch (err) {
    console.log("CASHBACK CRON JOB ERROR=>", err);
    // sendCronReport("cron_ref_1_F");
  }
};

// job();
cashback_job();
// module.exports = refferal_job;
