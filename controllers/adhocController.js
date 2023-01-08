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

const addWalletBalance = async (req, res, next) => {
  const { order_id } = req.body;
  try {
    const order = await Order.findOne({ where: { order_id } });
    if (!order) {
      return res.status(404).send({
        success: false,
        data: [],
        message:
          "The order does not exist and hence wallet balance could not be added",
      });
    }

    const customer = await Customer.findOne({
      where: { cust_no: order.cust_no },
    });

    const itemWalletExists = await Wallet.findOne({
      where: {
        cust_no: order.cust_no,
        item_specific_balance: {
          [Op.gt]: 500,
        },
      },
    });

    if (itemWalletExists) {
      return res.status(200).send({
        success: true,
        data: itemWalletExists,
        message: "Butter wallet exists for current user",
      });
    }

    const [firstOrderWithButter, metadata] =
      await sequelize.query(`select t_order.order_id,t_order_items.quantity,t_batch.sale_price
        from ((t_order 
        inner join t_order_items on t_order_items.order_id = t_order.order_id)
        inner join t_batch on t_batch.item_id = t_order_items.item_id)
        where t_batch.mark_selected = 1 and t_order_items.item_id = ${72533} and t_order.order_id <> ${order_id} and t_order.cust_no = '${
        customer.cust_no
      }' order by t_order.created_at`);

    console.log(firstOrderWithButter);

    //Amul Butter 500gm - 72533

    if (firstOrderWithButter.length === 0) {
      const currentOrderItems = await OrderItems.findAll({
        where: { order_id: order.order_id },
      });

      let walletBalanceToBeAdded = null;

      currentOrderItems.map(async (currentItem) => {
        if (currentItem.item_id === 72533) {
          const selectedBatch = await Batch.findOne({
            where: { item_id: currentItem.item_id, mark_selected: 1 },
          });

          if (selectedBatch) {
            walletBalanceToBeAdded =
              0.5 * (currentItem.quantity * selectedBatch.sale_price);
          }

          console.log(
            "Wallet Balance to be added ======>",
            walletBalanceToBeAdded
          );

          const update = await Wallet.update(
            {
              item_specific_balance: walletBalanceToBeAdded,
            },
            {
              where: { cust_no: customer.cust_no },
            }
          );
        }
      });

      const updatedWallet = await Wallet.findOne({
        where: { cust_no: customer.cust_no },
      });

      return res.status(200).send({
        success: true,
        data: updatedWallet,
        message: "Successfully added Amul butter balance to customer wallet",
      });
    }

    return res.status(200).send({
      success: true,
      data: [],
      message: "Amul Balance not added as you have ordered it before",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

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

    console.log(order);

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

      allStrategies.map((currentStrategy) => {
        let item_list = JSON.parse(currentStrategy.items_list);

        // console.log("ABCD", this_item_id, item_list);

        let ress = item_list.filter((item) => {
          return item == this_item_id;
        });
        // check item exist in any strategy or not
        if (ress.length > 0) {
          // check if it is instant cashback
          if (currentStrategy.instant_cashback) {
            // check if it is not first buy
            if (!currentStrategy.first_buy) {
              wallet_amt =
                current_item.quantity *
                ((current_item.offer_price / 100) *
                  currentStrategy.amount_of_discount);

              special_wallet_balance = special_wallet_balance + wallet_amt;

              let transaction = {
                wallet_amt: wallet_amt,
                item_id: current_item.item_id,
                item_qty: current_item.quantity,
                offer_name: currentStrategy.offer_name,
              };
              special_wallet_transactions.push(transaction);
            } else {
              // if this is first buy
              // check this is your first purchase in the time span or not
            }
          }
        }
      });
    });

    console.log(special_wallet_transactions);
    console.log(special_wallet_balance);

    let specialWalletService = new SpecialWalletService();

    // credit amount
    specialWalletService.creditAmount(
      special_wallet_balance,
      order.cust_no,
      "special wallet balance added"
    );

    // credit transaction
    specialWalletService.creditAmountTransaction(
      order.cust_no,
      special_wallet_transactions
    );

    return res.status(200).send({
      success: true,
      data: [],
      message: "Successfully added special wallet balance to customer wallet",
    });

    // only first time?
    const [firstOrderWithButter, metadata_2] =
      await sequelize.query(`select t_order.order_id,t_order_items.quantity,t_batch.sale_price
        from ((t_order
        inner join t_order_items on t_order_items.order_id = t_order.order_id)
        inner join t_batch on t_batch.item_id = t_order_items.item_id)
        where t_batch.mark_selected = 1 and t_order_items.item_id = ${72533} and t_order.order_id <> ${order_id} and t_order.cust_no = '${
        customer.cust_no
      }' order by t_order.created_at`);
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = { addWalletBalance, checkBatchNo, addSpecialWalletBalance };
