const db = require("../../models");

const {
  sendOrderStatusToWhatsapp,
  sendReturnOrderStatusToWhatsapp,
  sendReturnOrderRejectStatusToWhatsapp,
} = require("../../services/whatsapp/whatsapp");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const ReturnOrder = db.ReturnOrdersModel;
const Batch = db.BatchModel;
const Inventory = db.InventoryModel;
const Item = db.ItemModel;
const Customer = db.CustomerModel;
const Coupon = db.CouponsModel;

const getAllDeliveryOrders = async (req, res, next) => {
  const { user_id } = req;
  const { status } = req.body;
  try {
    const allOrders = await Order.findAll({
      where: { delivery_boy: user_id, status },
    });

    if (allOrders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no orders for you",
      });
    }

    const outerPromises = await allOrders.map(async (currentOrder) => {
      const currentCustomer = await Customer.findOne({
        where: { cust_no: currentOrder.cust_no },
      });

      const orderItems = await OrderItems.findAll({
        where: { order_id: currentOrder.order_id },
      });

      let coupon;
      if (currentOrder.coupon_id) {
        coupon = await Coupon.findOne({
          where: { id: currentOrder.coupon_id },
        });
      }

      const promises = await orderItems.map(async (currentReturnedItem) => {
        const item = await Item.findOne({
          where: { id: currentReturnedItem.item_id },
        });

        const selectedBatch = await Batch.findOne({
          where: { item_id: currentReturnedItem.item_id, mark_selected: 1 },
        });

        let inventory;
        if (selectedBatch) {
          inventory = await Inventory.findOne({
            where: {
              batch_id: selectedBatch.id,
              item_id: currentReturnedItem.item_id,
              location_id: 4,
              balance_type: 1,
            },
          });
        }

        return {
          itemId: currentReturnedItem.item_id,
          quantity: currentReturnedItem.quantity,
          itemName: item ? item.name : "",
          image: item ? item.image : "",
          MRP: selectedBatch ? selectedBatch.MRP : "",
          salePrice: selectedBatch ? selectedBatch.sale_price : "",
          expiryDate: selectedBatch ? selectedBatch.expiry_date : "",
          discount: selectedBatch ? selectedBatch.discount : "",
          costPrice: selectedBatch ? selectedBatch.cost_price : "",
          cashback: inventory ? inventory.cashback : "",
          cashbackIsPercentage: inventory
            ? inventory.cashback_is_percentage
            : "",
        };
      });

      const itemDetails = await Promise.all(promises);

      return {
        orderId: currentOrder.order_id,
        date: currentOrder.created_at,
        customerAddress: currentOrder.address,
        total: currentOrder.total,
        payableAmount: currentOrder.final_payable_amount,
        customerName: currentCustomer ? currentCustomer.cust_name : "",
        customerPhoneNumber: currentCustomer ? currentCustomer.contact_no : "",
        customerEmail: currentCustomer ? currentCustomer.email : "",
        status: currentOrder.status,
        returnStatus: currentOrder.return_status,
        paidByWallet: currentOrder.wallet_balance_used,
        couponUsed: coupon ? coupon.code : "",
        couponDiscount: coupon ? coupon.amount_of_discount : "",
        couponIsPercentage: coupon ? coupon.is_percentage : "",
        itemDetails,
      };
    });

    const resolved = await Promise.all(outerPromises);
    const orders = await resolved.filter((current) => {
      return current != undefined;
    });

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

const changeStatusOfDeliveryOrder = async (req, res, next) => {
  const { user_id } = req;
  const { order_id } = req.params;
  const { status, date, pin } = req.body;

  try {
    if (status === "Delivered" && !pin) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Please enter the PIN to deliver the current order",
      });
    }

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

    if (
      orderExists.status === "Shipped" &&
      status === "Delivered" &&
      parseInt(pin) !== orderExists.pin
    ) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "PIN entered for current order is incorrect",
      });
    }

    await Order.update(
      { status, delivery_date: date },
      {
        where: { order_id, delivery_boy: user_id },
      }
    );

    const updatedOrder = await Order.findOne({
      where: { order_id, delivery_boy: user_id },
      include: [{ model: OrderItems }],
    });

    // getting data for sending notification in whatsapp
    let cust_no = updatedOrder.dataValues.cust_no;
    let order_status = updatedOrder.dataValues.status;
    const currentCustomer = await Customer.findOne({
      where: { cust_no: cust_no },
    });
    let ph_no = currentCustomer.contact_no;

    //Send notification in whatsapp about order status
    if (ph_no && order_id && order_status)
      sendOrderStatusToWhatsapp(ph_no, order_id, order_status);

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
  const { return_status, reject_reason, date } = req.body;

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

    if (return_status === "r" && !reject_reason) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter a rejection reason for rejecting this return",
      });
    }

    const currentOrder = await Order.findOne({
      where: { order_id },
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

    const returnedItems = await ReturnOrder.findAll({
      where: { delivery_boy: user_id, order_id },
    });

    if (returnedItems.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "There are no return items for this order",
      });
    }

    //Update inventory

    // if (return_status === "r") {
    //   await ReturnOrder.destroy({
    //     where: { order_id },
    //   });
    // }

    if (return_status === "a") {
      returnedItems.map(async (current) => {
        const oldestBatch = await Batch.findOne({
          where: { item_id: current.item_id, mark_selected: 1 },
        });
        let inventory;
        if (oldestBatch) {
          inventory = await Inventory.findOne({
            where: {
              batch_id: oldestBatch.id,
              item_id: current.item_id,
              location_id: 4,
              balance_type: 8,
            },
          });

          if (inventory) {
            await Inventory.update(
              {
                quantity: inventory.quantity + current.quantity,
              },
              {
                where: {
                  batch_id: oldestBatch.id,
                  item_id: current.item_id,
                  location_id: 4,
                  balance_type: 8,
                },
              }
            );
          } else {
            await Inventory.create({
              quantity: current.quantity,
              batch_id: oldestBatch.id,
              item_id: current.item_id,
              location_id: 4,
              balance_type: 8,
              created_by: 1,
              active_ind: "Y",
            });
          }
        }
      });
    }

    await Order.update(
      {
        return_status,
        status: "Returned",
        reject_reason,
        pickup_date: date,
      },
      {
        where: { order_id },
      }
    );

    const updatedOrder = await Order.findOne({
      where: { order_id },
    });

    //Notify admin and user

    // getting data for sending notification in whatsapp
    let cust_no = updatedOrder.dataValues.cust_no;
    const currentCustomer = await Customer.findOne({
      where: { cust_no: cust_no },
    });
    let ph_no = currentCustomer.contact_no;
    let return_status_full_name =
      return_status === "r" ? "Rejected" : "Accepted";
    console.log("========", ph_no, order_id, return_status_full_name);

    //Send notification in whatsapp about order status
    if (return_status === "a") {
      if (ph_no && order_id && return_status_full_name)
        sendReturnOrderStatusToWhatsapp(
          ph_no,
          order_id,
          return_status_full_name
        );
    }

    if (return_status === "r") {
      if (ph_no && order_id && return_status_full_name && reject_reason)
        sendReturnOrderRejectStatusToWhatsapp(
          ph_no,
          order_id,
          return_status_full_name,
          reject_reason
        );
    }

    return res.status(200).send({
      success: true,
      data: {
        oldOrderDetails: currentOrder,
        newOrderDetails: updatedOrder,
      },
      message: `Return for this order was ${
        return_status === "r" ? "Rejected" : "Accepted"
      }`,
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
  const { return_status } = req.body;
  try {
    const allOrders = await Order.findAll({
      where: { return_status },
    });

    if (allOrders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no orders for you",
      });
    }

    console.log(allOrders);

    const outerPromises = await allOrders.map(async (currentOrder) => {
      const returnedItems = await ReturnOrder.findAll({
        where: { order_id: currentOrder.order_id, delivery_boy: user_id },
      });

      console.log("Returned items for this order", returnedItems);

      let coupon;
      if (currentOrder.coupon_id) {
        coupon = await Coupon.findOne({
          where: { id: currentOrder.coupon_id },
        });
      }

      let currentCustomer;
      let returnedItemsWithoutUndefined = [];
      let promises = [];

      if (returnedItems.length !== 0) {
        returnedItemsWithoutUndefined = await returnedItems.filter(
          (current) => {
            return current !== undefined;
          }
        );

        promises = await returnedItemsWithoutUndefined.map(
          async (currentReturnedItem) => {
            console.log("Inside Map");
            const item = await Item.findOne({
              where: { id: currentReturnedItem.item_id },
            });

            const selectedBatch = await Batch.findOne({
              where: { item_id: currentReturnedItem.item_id, mark_selected: 1 },
            });

            let inventory;
            if (selectedBatch) {
              inventory = await Inventory.findOne({
                where: {
                  batch_id: selectedBatch.id,
                  item_id: currentReturnedItem.item_id,
                  location_id: 4,
                  balance_type: 1,
                },
              });
            }

            currentCustomer = await Customer.findOne({
              where: { cust_no: currentOrder.cust_no },
            });

            return {
              itemId: currentReturnedItem.item_id,
              returnedQuantity: currentReturnedItem.quantity,
              itemName: item.name,
              image: item.image,
              MRP: selectedBatch ? selectedBatch.MRP : "",
              salePrice: selectedBatch ? selectedBatch.sale_price : "",
              expiryDate: selectedBatch ? selectedBatch.expiry_date : "",
              discount: selectedBatch ? selectedBatch.discount : "",
              costPrice: selectedBatch ? selectedBatch.cost_price : "",
              cashback: inventory ? inventory.cashback : "",
              cashbackIsPercentage: inventory
                ? inventory.cashback_is_percentage
                : "",
            };
          }
        );

        const itemDetails = await Promise.all(promises);

        return {
          orderId: currentOrder.order_id,
          date: currentOrder.created_at,
          customerAddress: currentOrder.address,
          total: currentOrder.total,
          payableAmount: currentOrder.final_payable_amount,
          customerName: currentCustomer ? currentCustomer.cust_name : "",
          customerPhoneNumber: currentCustomer
            ? currentCustomer.contact_no
            : "",
          customerEmail: currentCustomer ? currentCustomer.email : "",
          status: currentOrder.status,
          returnStatus: currentOrder.return_status,
          paidByWallet: currentOrder.wallet_balance_used,
          couponUsed: coupon ? coupon.code : "",
          couponDiscount: coupon ? coupon.amount_of_discount : "",
          couponIsPercentage: coupon ? coupon.is_percentage : "",
          itemDetails,
        };
      }
    });

    const resolved = await Promise.all(outerPromises);
    const orders = await resolved.filter((current) => {
      return current != undefined;
    });

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
  changeStatusOfDeliveryOrder,
  changeStatusOfReturnOrder,
  getAllRequestedReturns,
  getAllDeliveryOrders,
};
