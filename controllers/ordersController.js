const { sequelize } = require("../models");
const db = require("../models");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel

const getAllOrders = async (req, res, next) => {

  //Get currentUser from req.payload.cust_no
  const currentUser = req.cust_no;

  //Get all order ids for that customer number
  try {

    // `select t_lkp_order.order_id, t_lkp_order.created_at, t_lkp_order.status, t_item.id, t_item.name, t_order_items.quantity, t_item.image
    // from ((t_lkp_order
    // inner join t_order_items on t_order_items.order_id = t_lkp_order.order_id)
    // inner join t_item on t_item.id = t_order_items.item_id)
    // where t_lkp_order.cust_no = "${currentUser}"`

    const allOrders = await Order.findAll({
      where: { cust_no: currentUser }
    })

    const orderPromises = allOrders.map(async (currentOrder) => {

      const orderItems = await OrderItems.findAll({
        where: { order_id: currentOrder.order_id }
      })

      const orderItemPromises = orderItems.map(async (currentOrderItem) => {

        const currentItem = await Item.findOne({
          where: { id: currentOrderItem.item_id }
        })

        return ({
          itemName: currentItem.name,
          id: currentItem.id,
          image: currentItem.image,
          quantity: currentOrderItem.quantity
        })
      })

      const orderItemsArray = await Promise.all(orderItemPromises)

      return ({
        orderID: currentOrder.order_id,
        Date: currentOrder.created_at,
        status: currentOrder.status,
        itemDetails: orderItemsArray,
      })

    })

    const orders = await Promise.all(orderPromises)

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Found all orders for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error while fetching orders for current user",
    });
  }
};

const getOrderByOrderId = async (req, res, next) => {
  //Get currentUser from req.cust_no

  const currentUser = req.cust_no

  //Get order id from req.params
  const orderId = req.params.orderId;

  try {
    //Get that order according to its id


    const [singleOrder, metadata] = await sequelize.query(`
    
    select t_lkp_order.order_id, t_lkp_order.created_at, t_lkp_order.status, t_item.id, t_item.name, t_order_items.quantity, t_item.image
    from ((t_lkp_order
    inner join t_order_items on t_order_items.order_id = t_lkp_order.order_id)
    inner join t_item on t_item.id = t_order_items.item_id)
    where t_lkp_order.cust_no = "${currentUser}"
    AND 
    t_lkp_order.order_id = ${orderId}`)

    if (singleOrder.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for the current user",
      });
    }

    console.log(singleOrder);

    const promises = singleOrder.map(async (currentItem) => {
      return ({
        itemName: currentItem.name,
        id: currentItem.id,
        quantity: currentItem.quantity,
        image: currentItem.image,
      })
    })

    const responseArray = await Promise.all(promises)

    return res.status(200).send({
      success: true,
      data: {
        orderID: singleOrder[0].order_id,
        Date: singleOrder[0].created_at,
        status: singleOrder[0].status,
        itemDetails: responseArray
      },
      message: "Order successfully fetched for the user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error while fetching orders for current user",
    });
  }
};
const cancelOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  //const currentUser = req.cust_no

  //get orderId from req.body
  const orderId = req.body.orderId;

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne(
      {
        include: [
          {
            model: OrderItems,
            attributes: ["order_id"],
          },
        ],
      },
      {
        where: {
          //cust_no : currentUser,
          order_id: orderId,
        },
      }
    );

    if (singleOrder.length === 0) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    //Update status of status to say cancelled if the status is accepted or shipped
    //cannot cancel for returned and delivered and already cancelled

    return res.status(200).send({
      success: true,
      data: singleOrder,
      message: "Requested order successfully cancelled for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while trying to fetch requested order for current user",
    });
  }

};
const returnOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  //const currentUser = req.cust_no

  //get orderId from req.body
  const orderId = req.body.orderId;

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne(
      {
        include: [
          {
            model: OrderItems,
            attributes: ["order_id"],
          },
        ],
      },
      {
        where: {
          //cust_no : currentUser,
          order_id: orderId,
        },
      }
    );

    if (singleOrder.length === 0) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    //Update status of status to say returned if the status is accepted or shipped or delivered
    //cannot return for cancelled and already returned

    return res.status(200).send({
      success: true,
      data: singleOrder,
      message: "Requested order successfully Returned",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while trying to fetch requested order for current user",
    });
  }
};
const trackOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  //const currentUser = req.cust_no

  //get orderId from req.params
  const orderId = req.params.orderId;

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne(
      {
        include: [
          {
            model: OrderItems,
            attributes: ["order_id"],
          },
        ],
      },
      {
        where: {
          //cust_no : currentUser,
          order_id: orderId,
        },
      }
    );

    if (singleOrder.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: singleOrder, //Send the status from here instead of the entire data
      message: "Requested order successfully fetched",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error,
      message: "Error occured while fetching the requested order for the current user",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderByOrderId,
  cancelOrder,
  returnOrder,
  trackOrder,
};
