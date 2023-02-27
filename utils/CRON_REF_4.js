//special wallet cashback job after 7 days
// THIS WILL RUN FIRST, THEN CASHBACK CRON WILL RUN
require("dotenv").config();
const cron = require("node-cron");
const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");
const db2 = require("../services/dbSetupService.js");

const SpecialWalletService = require("../services/specialWalletService");

const Customer = db.CustomerModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const WalletStrategyTable = db.SpecialWalletStrategy;
const { sendCronReport } = require("../services/whatsapp/whatsappMessages");

const addSpecialWalletBalance = async () => {
  let sevenDaysAgo = new Date();
  // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate());

  let all_orders = await Order.findAll({
    where: {
      status: "Delivered",
      special_cashback_processed: { [Op.eq]: null },
      cashback_processed: { [Op.eq]: null },
      created_at: { [Op.lt]: sevenDaysAgo },
    },
  });

  try {
    all_orders.map(async (current_order) => {
      console.log("=>>>>", current_order.order_id);
      let order_id = current_order.dataValues.order_id;

      // my code
      const order = await Order.findOne({ where: { order_id } });

      let specialWalletService = new SpecialWalletService();

      const customer = await Customer.findOne({
        where: { cust_no: order.cust_no },
      });

      // fetch all stretegies
      const allStrategies = await WalletStrategyTable.findAll({
        where: {
          status: 1,
          instant_cashback: 0,
        },
      });

      // fetch the order
      const order_details = await OrderItems.findAll({
        where: {
          order_id: order_id,
        },
      });

      let special_wallet_transactions = [];
      let special_wallet_balance = 0;

      order_details.map((current_item) => {
        if (current_item.special_cashback_processed != 1) {
          let this_item_id = current_item.item_id;
          let this_item_qty = current_item.quantity;

          allStrategies
            .map(async (currentStrategy) => {
              let item_list = JSON.parse(currentStrategy.items_list);

              console.log("ABCD", this_item_id, item_list);

              let isItemAvailable = item_list.indexOf(
                JSON.stringify(this_item_id)
              );
              console.log("CHECK," + this_item_id + " " + item_list);
              // check item exist in any strategy or not
              if (isItemAvailable >= 0) {
                console.log("YES ITEM AVAILABLE," + this_item_id);
                // check if it is not first buy
                // console.log("FIRST BUY????????");
                if (!currentStrategy.first_buy) {
                  // console.log("NOOOOOO");
                  wallet_amt =
                    current_item.quantity *
                    ((current_item.sale_price / 100) *
                      currentStrategy.amount_of_discount);

                  let transaction = [
                    {
                      wallet_amt: wallet_amt,
                      item_id: current_item.item_id,
                      item_qty: current_item.quantity,
                      offer_name: currentStrategy.offer_name,
                      order_id: order_id,
                    },
                  ];

                  // credit amount
                  specialWalletService.creditAmount(
                    wallet_amt,
                    order.cust_no,
                    "special wallet balance added"
                  );

                  // credit transaction
                  specialWalletService.creditAmountTransaction(
                    order.cust_no,
                    transaction
                  );

                  // mark special wallet balance processed as 1
                  // mark the order as spcl cashback processed

                  OrderItems.update(
                    {
                      special_cashback_processed: 1,
                      special_cashback_amount: wallet_amt,
                    },
                    {
                      where: {
                        order_id: order_id,
                        item_id: current_item.item_id,
                      },
                    }
                  );

                  const updated_order = await Order.update(
                    {
                      special_cashback_processed: 1,
                    },
                    { where: { order_id: order_id } }
                  );
                } else {
                  // console.log("YESSSSS");
                  let is_first_buy = true;
                  // if this is first buy
                  // check this is your first purchase in the time span or not

                  const startDate = new Date(
                    currentStrategy.start_date
                  ).toISOString();
                  const endDate = new Date(
                    currentStrategy.expiry_date
                  ).toISOString();

                  const [ordresInTheSpan, metadata_2] =
                    await sequelize.query(`select * from t_order where cust_no = "${order.cust_no}" and status='Delivered'
                  and created_at BETWEEN '${startDate}' and '${endDate}'`);

                  const cust_orders_in_the_span = async () => {
                    is_first_buy = 0;
                    await Promise.all(
                      ordresInTheSpan.map(async (current_order) => {
                        const [order_items, metadata_3] =
                          await sequelize.query(`
                          select item_id from t_order_items toi where toi.order_id = ${current_order.order_id}
                        `);

                        await Promise.all(
                          order_items.map(async (prev_order_current_item) => {
                            if (
                              prev_order_current_item.item_id ==
                              current_item.item_id
                            ) {
                              is_first_buy++;
                              console.log("ADDD");
                            }
                          })
                        );
                      })
                    );
                  };

                  cust_orders_in_the_span().then(() => {
                    // if this purchase is first buy then add balance

                    console.log("IS FIRST BUY", is_first_buy);
                    if (is_first_buy == 1) {
                      wallet_amt =
                        current_item.quantity *
                        ((current_item.sale_price / 100) *
                          currentStrategy.amount_of_discount);

                      // special_wallet_balance = special_wallet_balance + wallet_amt;

                      let transaction = [
                        {
                          wallet_amt: wallet_amt,
                          item_id: current_item.item_id,
                          item_qty: current_item.quantity,
                          offer_name: currentStrategy.offer_name,
                          order_id: order_id,
                        },
                      ];

                      // credit amount
                      specialWalletService.creditAmount(
                        wallet_amt,
                        order.cust_no,
                        "special wallet balance added"
                      );

                      // credit transaction
                      specialWalletService.creditAmountTransaction(
                        order.cust_no,
                        transaction
                      );

                      // const updated_order = Order.update(
                      //   {
                      //     special_cashback_processed: 1,
                      //   },
                      //   { where: { order_id: order_id } }
                      // );

                      OrderItems.update(
                        {
                          special_cashback_processed: 1,
                          special_cashback_amount: wallet_amt,
                        },
                        {
                          where: {
                            order_id: order_id,
                            item_id: current_item.item_id,
                          },
                        }
                      );

                      const updated_order = Order.update(
                        {
                          special_cashback_processed: 1,
                        },
                        { where: { order_id: order_id } }
                      );
                    } else {
                      console.log(
                        "Customer already purchased this item before.."
                      );
                    }
                  });
                }
              }
            })[0]
            .then((res) => {
              console.log("MAP COMPLETED");
            });
        }
      });

      console.log("VALUES TO BE ADDED");
      console.log(special_wallet_transactions);
      console.log(special_wallet_balance);
    });

    sendCronReport("cron_ref_4_S");
  } catch (error) {
    console.log(error.message);
    sendCronReport("cron_ref_4_F");
  }
};

// const special_wallet_job = async () => {
//   // schedule time is a utc time (11.30pm ist = 6:00pm utc/18:00)
//   cron.schedule("0 20 18 * * *", async () => {
//     console.log("Running scheduled CRON-JOB.....");

//     // cashback task
//     await addSpecialWalletBalance();
//   });
// };

// module.exports = special_wallet_job;

addSpecialWalletBalance();
