const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");

const SpecialWalletService = require("../services/specialWalletService");

const Customer = db.CustomerModel;
const Wallet = db.WalletModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Batch = db.BatchModel;
const Item = db.ItemModel;
const WalletStrategyTable = db.SpecialWalletStrategy;

const checkBatchNo = async (req, res, next) => {
  const { id, batch_no } = req.body;
  try {
    if (id === "" || batch_no === "") {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all required details",
      });
    }
    const currentItem = await Item.findOne({
      where: { id },
    });

    if (!currentItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist",
      });
    }

    const batches = await Batch.findAll({
      where: { item_id: id },
    });

    if (batches.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no batches for this item",
      });
    }

    let existing = false;
    batches.map((current) => {
      if (current.batch_no === batch_no) {
        existing = true;
      }
    });

    if (existing) {
      return res.status(400).send({
        success: false,
        data: [],
        message: `Batch number ${batch_no} already exists, please enter a new batch number`,
      });
    }

    return res.status(200).send({
      success: true,
      data: [],
      message: "This is not a duplicate batch number",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const addSpecialWalletBalance = async (req, res, next) => {
  console.log("coming here");
  const { order_id } = req.body;
  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).send({
        success: false,
        data: [],
        message:
          "The order does not exist and hence special wallet balance could not be added",
      });
    }

    // console.log(order);

    let specialWalletService = new SpecialWalletService();

    const customer = await Customer.findOne({
      where: { cust_no: order.cust_no },
    });

    // fetch all stretegies
    const allStrategies = await WalletStrategyTable.findAll({
      where: {
        status: 1,
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
      let this_item_id = current_item.item_id;
      let this_item_qty = current_item.quantity;

      allStrategies
        .map(async (currentStrategy) => {
          let item_list = JSON.parse(currentStrategy.items_list);

          // console.log("ABCD", this_item_id, item_list);

          // let ress = item_list.filter(async (item) => {
          //   return item == this_item_id;
          // });
          let isItemAvailable = item_list.indexOf(JSON.stringify(this_item_id));
          console.log("CHECK," + this_item_id + " " + item_list);
          // check item exist in any strategy or not
          if (isItemAvailable >= 0) {
            console.log("YES ITEM AVAILABLE," + this_item_id);
            // check if it is instant cashback
            if (currentStrategy.instant_cashback) {
              // check if it is not first buy
              // console.log("FIRST BUY????????");
              if (!currentStrategy.first_buy) {
                // console.log("NOOOOOO");
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
                // special_wallet_transactions.push(transaction);
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
                  await sequelize.query(`select * from t_order where cust_no = "971medumge3l7prya6i" and status='Delivered'
                and created_at BETWEEN '${startDate}' and '${endDate}'`);
                // console.log(ordresInTheSpan);
                ordresInTheSpan.map(async (current_order) => {
                  // console.log(current_order.order_id);
                  const [order_items, metadata_3] = await sequelize.query(`
                select item_id from t_order_items toi where toi.order_id = ${current_order.order_id}
                `);
                  // console.log(current_order.order_id + " => ");
                  // console.log(order_items);

                  order_items.map((prev_order_current_item) => {
                    if (
                      prev_order_current_item.item_id == current_item.item_id
                    ) {
                      is_first_buy = false;
                    }
                  });
                });

                // if this purchase is first buy then add balance
                console.log("IS FIRST BUY", is_first_buy);
                if (is_first_buy) {
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
                  // console.log(
                  //   "=>",
                  //   wallet_amt,
                  //   current_item.quantity,
                  //   current_item.sale_price,
                  //   currentStrategy.amount_of_discount
                  // );
                  // special_wallet_transactions.push(transaction);
                }
              }
            }
          }
        })[0]
        .then((res) => {
          console.log("MAP COMPLETED");
        });
    });

    // console.log("VALUES TO BE ADDED");
    // console.log(special_wallet_transactions);
    // console.log(special_wallet_balance);

    return res.status(200).send({
      success: true,
      data: [],
      message: "Successfully added special wallet balance to customer wallet",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = { checkBatchNo, addSpecialWalletBalance };
