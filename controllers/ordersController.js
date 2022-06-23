const db = require("../models");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;

const getAllOrders = async (req, res, next) => {
  //Get currentUser from req.cust_no
  //const currentUser = req.cust_no

  //Get all order ids for that customer number

  try {
    const allOrders = await Order.findAll(
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
          //cust_no: currentUser,
        },
      }
    );

    if (allOrders.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No orders found for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: allOrders,
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

  //const currentUser = req.cust_no

  //Get order id from req.params
  const orderId = req.params.orderId;

  try {
    //Get that order according to its id
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
          // cust_no : currentUser,
          order_id: orderId,
        },
      }
    );

    if (singleOrder.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for the current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: singleOrder,
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
