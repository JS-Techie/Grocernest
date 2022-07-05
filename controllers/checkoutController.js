const { sequelize } = require("../models");
const axios = require("axios");
const db = require("../models");
const { removeItemFromWishlist } = require("./wishlistController");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Cart = db.CartModel;

const checkoutFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  if(!req.body.address_id){
    return res.status(400).send({
      success : false,
      data : null,
      message : "Please enter correct address"
    })
  }

  try {
    const cartForUser = await Cart.findAll({
      where: { cust_no: currentUser },
    });

    if (cartForUser.length === 0) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "The user does not have any items in his cart",
      });
    }

    const newOrder = await Order.create({
      cust_no: currentUser,
      order_id: Math.floor(Math.random() * 10000000 + 1),
      status: "Placed",
      created_by: 2,
    });

    const promises = cartForUser.map(async (currentItem) => {
      return {
        order_id: newOrder.order_id,
        item_id: currentItem.item_id,
        quantity: currentItem.quantity,
        created_by: newOrder.created_by,
      };
    });

    const resolved = await Promise.all(promises);
    const newOrderItems = await OrderItems.bulkCreate(resolved);
    const orderItemsPromises = newOrderItems.map(async (currentItem) => {
      return {
        itemID: currentItem.item_id,
        quantity: currentItem.quantity,
      };
    });

    const orderItemsResolved = await Promise.all(orderItemsPromises);

    const deletedItemsFromCart = await Cart.destroy({
      where: { cust_no: currentUser },
    });

    return res.status(201).send({
      success: true,
      data: {
        currentUser: currentUser,
        orderID: newOrder.order_id,
        orderItems: orderItemsResolved,
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
  const { itemID, quantity } = req.body;

  if(!req.body.address_id){
    return res.status(400).send({
      success : false,
      data : null,
      message : "Please enter correct address"
    })
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

    const currentItem = currentItemDetails[0];

    const newOrder = await Order.create({
      cust_no: currentUser,
      order_id: Math.floor(Math.random() * 10000000 + 1),
      status: "Placed",
      created_by: 2,
    });

    const newOrderItem = await OrderItems.create({
      order_id: newOrder.order_id,
      item_id: currentItem.id,
      quantity: quantity,
      created_by: newOrder.created_by,
    });

    return res.status(201).send({
      success: true,
      data: {
        currentUser: currentUser,
        orderID: newOrder.order_id,
        orderStatus: newOrder.status,
        orderItems: {
          itemID: newOrderItem.item_id,
          quantity: newOrderItem.quantity,
        },
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
