const { sequelize } = require("../models");
const db = require("../models");
const uniqid = require('uniqid');

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Cart = db.CartModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;

const concatAddress = require("../utils/concatAddress");

const checkoutFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  const { total, address_id, applied_discount, final_payable_amount, wallet_balance_used, wallet_id } = req.body;

  if (!total) {
    return res.status(400).send({
      success: false,
      data: null,
      message: "Please enter the total amount",
    });
  }

  if (!address_id) {
    return res.status(400).send({
      success: false,
      data: null,
      message: "Please enter correct address",
    });
  }

  try {
    const cartForUser = await Cart.findAll({
      where: { cust_no: currentUser },
    });

    if (cartForUser.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "The user does not have any items in his cart",
      });
    }

    const address = await Promise.resolve(concatAddress(address_id));

    if (address === false) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No address found for entered address id",
      });
    }

    const newOrder = await Order.create({
      cust_no: currentUser,
      order_id: Math.floor(Math.random() * 10000000 + 1),
      status: "Placed",
      created_by: 2,
      total,
      address,
      applied_discount: applied_discount,
      final_payable_amount: final_payable_amount
    });

    const user_wallet = await Wallet.findOne({
      where: {
        cust_no: currentUser
      }
    })

    const wallet = await Wallet.update({
      balance: user_wallet.balance - wallet_balance_used
    },
      { where: { wallet_id: wallet_id } }
    )

    const wallet_transaction = await Wallet_Transaction.create({
      wallet_id: wallet_id,
      transaction_id: uniqid(),
      transaction_type: 'D',
      transaction_amount: wallet_balance_used,
      transaction_details: newOrder.order_id,
      created_by: 2
    })

    const promises = cartForUser.map(async (currentItem) => {
      return {
        order_id: newOrder.order_id,
        item_id: currentItem.item_id,
        quantity: currentItem.quantity,
        created_by: newOrder.created_by,
      };
    });

    const resolved = await Promise.all(promises);

    let newOrderItems = [];
    try {
      newOrderItems = await Promise.resolve(OrderItems.bulkCreate(resolved));
    } catch (error) {
      await Order.destroy({
        where: { order_id: newOrder.order_id },
      });

      return res.status(400).send({
        success: false,
        data: error.message,
        message:
          "Something went wrong while placing order, please check data field for more details",
      });
    }

    const orderItemsPromises = newOrderItems.map(async (currentItem) => {
      return {
        itemID: currentItem.item_id,
        quantity: currentItem.quantity,
      };
    });

    const orderItems = await Promise.all(orderItemsPromises);

    const deletedItemsFromCart = await Cart.destroy({
      where: { cust_no: currentUser },
    });

    return res.status(201).send({
      success: true,
      data: {
        currentUser: currentUser,
        orderID: newOrder.order_id,
        orderTotal: newOrder.total,
        orderAddress: newOrder.address,
        orderItems,
        numberOfDeletedItemsFromCart: deletedItemsFromCart,
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: {
        errorMessage: error.message,
        errors: error.errors,
      },
      message:
        "Error occurred while placing order, please check data field for more details",
    });
  }
};

const buyNow = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //Get the quantity and item ID from request body
  // wallet_balance_used, wallet_id
  const { itemID, quantity, total, address_id, applied_discount, final_payable_amount, wallet_balance_used, wallet_id } = req.body;

  if (!total) {
    return res.status(400).send({
      success: false,
      data: null,
      message: "Please enter order total",
    });
  }

  if (!address_id) {
    return res.status(400).send({
      success: false,
      data: null,
      message: "Please enter correct address",
    });
  }

  try {
    const [currentItemDetails, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
      ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name
      from ((((((ecomm.t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            INNER join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_item.id = ${itemID} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 order by t_batch.created_at;`);

    if (currentItemDetails.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Item details not found for item ID entered",
      });
    }

    const userGifts = await Cart.findAll({
      where: { cust_no: currentUser },
    });

    const address = await Promise.resolve(concatAddress(address_id));

    if (address == " ") {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No address found for entered address id",
      });
    }

    const newOrder = await Order.create({
      cust_no: currentUser,
      order_id: Math.floor(Math.random() * 10000000 + 1),
      status: "Placed",
      created_by: 2,
      total,
      address,
      applied_discount: applied_discount,
      final_payable_amount: final_payable_amount
    });

    const user_wallet = await Wallet.findOne({
      where: {
        cust_no: currentUser
      }
    })

    const wallet = await Wallet.update({
      balance: user_wallet.balance - wallet_balance_used
    },
      { where: { wallet_id: wallet_id } }
    )

    const wallet_transaction = await Wallet_Transaction.create({
      wallet_id: wallet_id,
      transaction_id: uniqid(),
      transaction_type: 'D',
      transaction_amount: wallet_balance_used,
      transaction_details: newOrder.order_id,
      created_by: 2
    })


    let promises = [];
    if (userGifts.length !== 0) {
      promises = userGifts.map(async (current) => {
        return {
          order_id: newOrder.order_id,
          item_id: current.item_id,
          quantity: 1,
          created_by: newOrder.created_by,
        };
      });
    }

    const orderItems = await Promise.all(promises);

    orderItems.push({
      order_id: newOrder.order_id,
      item_id: itemID,
      quantity,
      created_by: newOrder.created_by,
    });

    try {
      await OrderItems.bulkCreate(orderItems);
    } catch (error) {
      const res = await Order.destroy({
        where: { cust_no: currentUser, order_id: newOrder.order_id },
      });

      return res.status(400).send({
        success: false,
        data: error.message,
        message:
          "Could not add items to DB, please check data field for more details",
      });
    }
    const response = orderItems.map((current) => {
      return {
        itemID: current.item_id,
        quantity: current.quantity,
      };
    });

    const deletedItemsFromCart = await Cart.destroy({
      where: { cust_no: currentUser },
    });

    return res.status(201).send({
      success: true,
      data: {
        currentUser: currentUser,
        orderID: newOrder.order_id,
        orderStatus: newOrder.status,
        orderTotal: newOrder.total,
        orderItems: response,
        deletedItemsFromCart,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while placing order, please check data field for more details",
    });
  }
};

module.exports = {
  checkoutFromCart,
  buyNow,
};
