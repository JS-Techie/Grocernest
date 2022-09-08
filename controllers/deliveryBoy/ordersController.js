const db = require("../../models");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;

const getAllOrders = async (req, res, next) => {
  const { user_id } = req;
  try {
    const orders = await Order.findAll({
      where: { delivery_boy: user_id },
      include: [
        {
          model: OrderItems,
        },
      ],
    });

    if (orders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no orders for you",
      });
    }

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Found all orders for current delivery boy",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getOrderById = async (req, res, next) => {
  const { user_id } = req;
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { delivery_boy: user_id, order_id },
      include: [
        {
          model: OrderItems,
        },
      ],
    });

    if (!order) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested order not found for current delivery boy",
      });
    }

    return res.status(200).send({
      success: true,
      data: order,
      message: "Requested order found for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getOrderByStatus = async (req, res, next) => {
  const { user_id } = req;
  const { status } = req.params;

  try {
    const orders = await Order.findAll({
      where: { delivery_boy: user_id, status },
      include: [
        {
          model: OrderItems,
        },
      ],
    });

    if (orders.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested order not found for current delivery boy",
      });
    }

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Requested order found for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const changeStatusOfDeliveryOrder = async (req, res, next) => {
  const { user_id } = req;
  const { order_id } = req.params;
  const { status } = req.body;

  try {
    console.log(user_id);
    console.log(status);
    console.log(order_id);

    const orderExists = await Order.findOne({
      where: { order_id, delivery_boy: user_id },
      include: [{ model: OrderItems }],
    });

    if (!orderExists) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested order does not exist for current delivery boy",
      });
    }
    if (orderExists.status !== "Shipped") {
      return res.status(400).send({
        success: false,
        data: orderExists,
        message: `You cant change the status of the order as it is ${orderExists.status}`,
      });
    }

    await Order.update(
      { status },
      {
        where: { order_id, delivery_boy: user_id },
      }
    );

    const updatedOrder = await Order.findOne({
      where: { order_id, delivery_boy: user_id },
      include: [{ model: OrderItems }],
    });

    return res.status(200).send({
      success: true,
      data: {
        oldOrder: orderExists,
        newOrder: updatedOrder,
      },
      message: "Successfully updated status of current order",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const changeStatusOfReturnOrder = async (req, res, next) => {
  const { user_id } = req;
  const { order_id } = req.params;
  const { return_status } = req.body;

  try {
    // console.log(return_status);

    // console.log(return_status === "r");
    // console.log(return_status !== "r");

    if (return_status !== "a" && return_status !== "r" && !return_status) {
      console.log("In if");
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter correct status",
      });
    }

    const currentOrder = await Order.findOne({
      where: { delivery_boy: user_id, order_id },
    });

    if (!currentOrder) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested order not found",
      });
    }

    if (!currentOrder.return_status) {
      return res.status(400).send({
        success: false,
        data: currentOrder,
        message: "The return for this order has not been initiated yet",
      });
    }

    if (currentOrder.return_status === "c") {
      return res.status(400).send({
        success: false,
        data: currentOrder.return_status,
        message: `This return cannot be ${
          return_status === "a" ? "Accepted" : "Rejected"
        } as it has already been cancelled by the admin`,
      });
    }

    await Order.update(
      {
        return_status,
        status: "Returned",
      },
      {
        where: { delivery_boy: user_id, order_id },
      }
    );

    const updatedOrder = await Order.findOne({
      where: { delivery_boy: user_id, order_id },
    });

    //Notify admin and user

    return res.status(200).send({
      success: true,
      data: {
        oldOrderDetails: currentOrder,
        newOrderDetails: updatedOrder,
      },
      message: "Return for this order was accepted",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getAllDeliveryOrders = async (req, res, next) => {
  const { user_id } = req;
  try {
    const orders = await Order.findAll({
      where: { delivery_boy: user_id, return_status: null },
      include: [
        {
          model: OrderItems,
        },
      ],
    });

    if (orders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no orders for you",
      });
    }

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Found all orders for current delivery boy",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getAllRequestedReturns = async (req, res, next) => {
  const { user_id } = req;
  try {
    const orders = await Order.findAll({
      where: { delivery_boy: user_id, return_status: "i" },
      include: [
        {
          model: OrderItems,
        },
      ],
    });

    if (orders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no orders for you",
      });
    }

    return res.status(200).send({
      success: true,
      data: orders,
      message: "Found all orders for current delivery boy",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByStatus,
  changeStatusOfDeliveryOrder,
  changeStatusOfReturnOrder,
  getAllRequestedReturns,
  getAllDeliveryOrders,
};
