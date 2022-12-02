const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");

const Customer = db.CustomerModel;
const Wallet = db.WalletModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Batch = db.BatchModel;

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
          [Op.not]: null,
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
        where t_batch.mark_selected = 1 and t_order_items.item_id = ${1073} and t_order.order_id <> ${order_id} and t_order.cust_no = '${
        customer.cust_no
      }' order by t_order.created_at`);

    //Amul Butter 500gm - 72533

    if (firstOrderWithButter.length === 0) {
      const currentOrderItems = await OrderItems.findAll({
        where: { order_id: order.order_id },
      });

      let walletBalanceToBeAdded = null;
      currentOrderItems.map(async (currentItem) => {
        if (currentItem.item_id === 1073) {
          const selectedBatch = await Batch.findOne({
            where: { item_id: currentItem.item_id, mark_selected: 1 },
          });

          if (selectedBatch) {
            walletBalanceToBeAdded =
              currentItem.quantity * selectedBatch.sale_price;
          }
        }
      });

      await Wallet.update(
        {
          item_specific_balance: walletBalanceToBeAdded,
        },
        {
          where: { cust_no: customer.cust_no },
        }
      );

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

module.exports = { addWalletBalance };
