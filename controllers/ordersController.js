const { sequelize } = require("../models");
const db = require("../models");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;

const getAllOrders = async (req, res, next) => {
  //Get currentUser from req.payload.cust_no
  const currentUser = req.cust_no;

  //Get all order ids for that customer number
  try {
    const allOrders = await Order.findAll({
      where: { cust_no: currentUser },
    });

    // console.log(allOrders);

    if (allOrders.length === 0) {
      return res.status(200).send({
        success: false,
        data: [],
        message: "No orders found for current user",
      });
    }

    const orderPromises = allOrders.map(async (currentOrder) => {
      const orderItems = await OrderItems.findAll({
        where: { order_id: currentOrder.order_id },
      });

      const orderItemPromises = orderItems.map(async (currentOrderItem) => {
        const currentItem = await Item.findOne({
          where: { id: currentOrderItem.item_id },
        });

        const batches = await Batch.findAll({
          where: { item_id: currentItem.id },
          order: [["created_at", "ASC"]],
        });

        const batch = batches[0];

        return {
          itemName: currentItem.name,
          id: currentItem.id,
          image: currentItem.image,
          quantity: currentOrderItem.quantity,
          MRP: batch.MRP,
          salePrice: batch.sale_price,
          discount: batch.discount,
        };
      });

      const orderItemsArray = await Promise.all(orderItemPromises);

      let orderTotal = 0;
      orderItemsArray.map((current) => {
        orderTotal += current.quantity * current.MRP;
      });

      return {
        orderID: currentOrder.order_id,
        Date: currentOrder.created_at,
        status: currentOrder.status,
        orderTotal,
        itemDetails: orderItemsArray,
      };
    });

    const orders = await Promise.all(orderPromises);

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Found all orders for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error while fetching orders for current user",
    });
  }
};

const getOrderByOrderId = async (req, res, next) => {
  //Get currentUser from req.cust_no

  const currentUser = req.cust_no;

  //Get order id from req.params
  const orderId = req.params.orderId;

  try {
    //Get that order according to its id

    const [singleOrder, metadata] =
      await sequelize.query(`select t_lkp_order.order_id, t_lkp_order.created_at, t_lkp_order.status, t_item.id, t_item.name, t_order_items.quantity, t_item.image
    from ((t_lkp_order
    inner join t_order_items on t_order_items.order_id = t_lkp_order.order_id)
    inner join t_item on t_item.id = t_order_items.item_id)
    where t_lkp_order.cust_no = "${currentUser}"
    AND 
    t_lkp_order.order_id = ${orderId}`);

    if (singleOrder.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for the current user",
      });
    }

    const promises = singleOrder.map(async (currentOrderItem) => {
      const currentItem = await Item.findOne({
        where: { id: currentOrderItem.id },
      });

      const batches = await Batch.findAll({
        where: { item_id: currentItem.id },
        order: [["created_at", "ASC"]],
      });

      const batch = batches[0];

      return {
        itemName: currentItem.name,
        id: currentItem.item_id,
        image: currentItem.image,
        quantity: currentOrderItem.quantity,
        MRP: batch.MRP,
        salePrice: batch.sale_price,
        discount: batch.discount,
      };
    });

    const responseArray = await Promise.all(promises);

    let orderTotal = 0;
    responseArray.map((current) => {
      orderTotal += current.quantity * current.MRP;
    });

    return res.status(200).send({
      success: true,
      data: {
        orderID: singleOrder[0].order_id,
        Date: singleOrder[0].created_at,
        status: singleOrder[0].status,
        orderTotal,
        itemDetails: responseArray,
      },
      message: "Order successfully fetched for the user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error while fetching orders for current user",
    });
  }
};
const cancelOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  const currentUser = req.cust_no;

  //get orderId from req.body
  const orderId = req.params.orderId;

  console.log(orderId);

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne({
      where: {
        cust_no: currentUser,
        order_id: orderId,
      },
    });

    if (!singleOrder) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    let include_array = ["Placed", "Accepted", "Shipped"];

    if (!include_array.includes(singleOrder.status)) {
      return res.status(400).send({
        success: false,
        data: singleOrder,
        message: "This order cannot be cancelled",
      });
    }

    //if my string contains accepted or shipped we can cancel

    const updatedOrderStatus = await singleOrder.update({
      status: "Cancelled",
      where: { order_id: singleOrder.order_id },
    });

    //Update status of status to say cancelled if the status is accepted or shipped
    //cannot cancel for returned and delivered and already cancelled

    return res.status(200).send({
      success: true,
      data: updatedOrderStatus,
      message: "Requested order successfully cancelled for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while trying to fetch requested order for current user",
    });
  }
};
const returnOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  const currentUser = req.cust_no;

  //get orderId from req.body
  const orderId = req.params.orderId;

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne({
      where: {
        cust_no: currentUser,
        order_id: orderId,
      },
    });

    if (!singleOrder) {
      return res.status(400).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    let include_array = ["Placed", "Accepted", "Shipped", "Delivered"];
    if (!include_array.includes(singleOrder.status)) {
      return res.status(400).send({
        success: false,
        data: singleOrder,
        message: "This order cannot be returned",
      });
    }

    const updatedOrderStatus = await singleOrder.update({
      status: "Returned",
      where: { order_id: singleOrder.order_id },
    });

    return res.status(200).send({
      success: true,
      data: updatedOrderStatus,
      message: "Requested order successfully Returned",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while trying to fetch requested order for current user",
    });
  }
};
const trackOrder = async (req, res, next) => {
  //get currentUser from req.cust_no
  const currentUser = req.cust_no;

  //get orderId from req.params
  const orderId = req.params.orderId;

  try {
    //check if that orderId belongs to that customer
    const singleOrder = await Order.findOne({
      where: {
        cust_no: currentUser,
        order_id: orderId,
      },
    });

    if (!singleOrder) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: singleOrder.status, //Send the status from here instead of the entire data
      message: "Requested order successfully fetched",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while fetching the requested order for the current user",
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
