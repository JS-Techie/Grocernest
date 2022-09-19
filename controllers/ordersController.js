const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const WalletService = require("../services/walletService");
const {
  sendCancelledByUserStatusEmail,
} = require("../services/mail/mailService");
const validator = require("email-validator");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Offers = db.OffersModel;
const Inventory = db.InventoryModel;
const Customer = db.CustomerModel;
const ReturnOrder = db.ReturnOrdersModel;

const { sendOrderStatusToWhatsapp } = require("../services/whatsapp/whatsapp");

const getAllOrders = async (req, res, next) => {
  //Get currentUser from req.payload.cust_no
  const currentUser = req.cust_no;

  //Get all order ids for that customer number
  try {
    const allOrders = await Order.findAll({
      where: { cust_no: currentUser },
      order: [["created_at", "DESC"]],
    });

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
        let currentOffer = null;
        let isEdit = null;
        currentOffer = await Offers.findOne({
          where: {
            is_active: 1,
            [Op.or]: [
              { item_id_1: currentOrderItem.item_id },
              { item_id: currentOrderItem.item_id },
            ],
          },
        });
        if (currentOffer) {
          if (currentOffer.amount_of_discount) {
            isEdit = true;
          }
        }

        const currentItem = await Item.findOne({
          where: { id: currentOrderItem.item_id },
        });

        const oldestBatch = await Batch.findOne({
          where: { item_id: currentOrderItem.item_id, mark_selected: 1 },
        });

        let canReturn = true;

        const offers = await Offers.findAll({});
        if (offers.length !== 0) {
          offers.map((current) => {
            if (
              currentOrderItem.item_id === current.item_id_1 ||
              currentOrderItem.item_id === current.item_id_2
            ) {
              canReturn = false;
            }
          });
        }

        if (oldestBatch) {
          return {
            itemName: currentItem.name,
            id: currentItem.id,
            image: currentItem.image,
            quantity: currentOrderItem.quantity,
            MRP: oldestBatch.MRP,
            salePrice:
              currentOrderItem.is_offer === 1
                ? currentOrderItem.offer_price
                : oldestBatch.sale_price,
            discount: oldestBatch.discount,
            isGift: currentItem.is_gift === 1 ? true : false,
            isOffer: currentOrderItem.is_offer === 1 ? true : false,
            canEdit:
              currentOrderItem.is_offer === 1 ? (isEdit ? true : false) : "",
            canReturn,
            offerDetails: currentOffer
              ? {
                  offerID: currentOffer.id,
                  offerType: currentOffer.type,
                  itemX: currentOffer.item_id_1 ? currentOffer.item_id_1 : "",
                  quantityOfItemX: currentOffer.item_1_quantity
                    ? currentOffer.item_1_quantity
                    : "",
                  itemY: currentOffer.item_id_2 ? currentOffer.item_id_2 : "",
                  quantityOfItemY: currentOffer.item_2_quantity
                    ? currentOffer.item_2_quantity
                    : "",
                  itemID: currentOffer.item_id ? currentOffer.item_id : "",
                  amountOfDiscount: currentOffer.amount_of_discount
                    ? currentOffer.amount_of_discount
                    : "",
                  isPercentage: currentOffer.is_percentage ? true : false,
                  isActive: currentOffer.is_active ? true : false,
                }
              : "",
          };
        }
      });

      const orderItemsArray = await Promise.all(orderItemPromises);
      const responseWithoutUndefined = orderItemsArray.filter((current) => {
        return current !== undefined;
      });

      // let orderTotal = 0;
      // orderItemsArray.map((current) => {
      //   orderTotal += current.quantity * current.MRP;
      // });

      return {
        orderID: currentOrder.order_id,
        Date: currentOrder.created_at,
        status: currentOrder.status,
        orderTotal: currentOrder.total,
        applied_discount: currentOrder.applied_discount,
        final_payable_amount: currentOrder.final_payable_amount,
        cashback_amount: currentOrder.cashback_amount,
        itemDetails: responseWithoutUndefined,
        return_status: currentOrder.return_status,
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
      await sequelize.query(`select t_lkp_order.order_id, t_lkp_order.created_at, t_lkp_order.status, t_lkp_order.return_status,t_item.id, t_item.name, t_order_items.quantity, t_item.image,
      t_order_items.is_offer, t_order_items.is_gift, t_order_items.offer_price
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

    console.log("Current Order ----->", singleOrder);

    const promises = singleOrder.map(async (currentOrderItem) => {
      let currentOffer = null;
      let isEdit = null;

      currentOffer = await Offers.findOne({
        where: {
          is_active: 1,
          [Op.or]: [
            { item_id_1: currentOrderItem.id },
            { item_id: currentOrderItem.id },
          ],
        },
      });

      console.log("Current Item---->", currentOrderItem.id);
      console.log("Offer for this item----->", currentOffer);

      if (currentOffer) {
        if (currentOffer.amount_of_discount) {
          isEdit = true;
        }
      }

      const currentItem = await Item.findOne({
        where: { id: currentOrderItem.id },
      });

      const oldestBatch = await Batch.findOne({
        where: { item_id: currentOrderItem.id, mark_selected: 1 },
      });

      if (oldestBatch) {
        return {
          itemName: currentItem.name,
          id: currentItem.id,
          image: currentItem.image,
          isGift: currentItem.is_gift == 1 ? true : false,
          quantity: currentOrderItem.quantity,
          MRP: oldestBatch.MRP,
          salePrice:
            currentOrderItem.is_offer === 1
              ? currentOrderItem.offer_price
              : oldestBatch.sale_price,

          discount: oldestBatch.discount,
          isOffer: currentOrderItem.is_offer === 1 ? true : false,
          canEdit:
            currentOrderItem.is_offer === 1 ? (isEdit ? true : false) : "",
          offerDetails: currentOffer
            ? {
                offerID: currentOffer.id,
                offerType: currentOffer.type,
                itemX: currentOffer.item_id_1 ? currentOffer.item_id_1 : "",
                quantityOfItemX: currentOffer.item_1_quantity
                  ? currentOffer.item_1_quantity
                  : "",
                itemY: currentOffer.item_id_2 ? currentOffer.item_id_2 : "",
                quantityOfItemY: currentOffer.item_2_quantity
                  ? currentOffer.item_2_quantity
                  : "",
                itemID: currentOffer.item_id ? currentOffer.item_id : "",
                amountOfDiscount: currentOffer.amount_of_discount
                  ? currentOffer.amount_of_discount
                  : "",
                isPercentage: currentOffer.is_percentage ? true : false,
                isActive: currentOffer.is_active ? true : false,
              }
            : "",
        };
      }
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
        return_status: singleOrder[0].return_status,
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

    //Update status of status to say cancelled if the status is accepted or shipped
    //cannot cancel for returned and delivered and already cancelled

    let updateInventory = null;

    console.log(singleOrder.status);

    const itemsInOrder = await OrderItems.findAll({
      where: { order_id: orderId },
    });
    if (itemsInOrder.length > 0) {
      itemsInOrder.map(async (currentItem) => {
        const oldestBatch = await Batch.findOne({
          where: { item_id: currentItem.item_id, mark_selected: 1 },
        });

        if (oldestBatch) {
          const currentInventory = await Inventory.findOne({
            where: {
              item_id: currentItem.item_id,
              batch_id: oldestBatch.id,
              balance_type: 1,
              location_id: 4,
            },
          });

          const blockedInventory = await Inventory.findOne({
            where: {
              item_id: currentItem.item_id,
              batch_id: oldestBatch.id,
              balance_type: 7,
              quantity: {
                [Op.gt]: 0,
              },
            },
          });

          if (blockedInventory) {
            updateBlockedItem = await Inventory.update(
              {
                quantity: blockedInventory.quantity - currentItem.quantity,
              },
              {
                where: {
                  batch_id: oldestBatch.id,
                  item_id: currentItem.item_id,
                  balance_type: 7,
                },
              }
            );
          }

          updateInventory = await Inventory.update(
            {
              quantity: currentItem.quantity + currentInventory.quantity,
            },
            {
              where: {
                batch_id: oldestBatch.id,
                item_id: currentItem.item_id,
                balance_type: 1,
                location_id: 4,
              },
            }
          );
        }
      });
    }

    const updatedOrderStatus = await singleOrder.update({
      status: "Cancelled",
      where: { order_id: singleOrder.order_id },
    });

    // wallet refund when user cancels order
    // if (singleOrder.wallet_balance_used != 0) {
    //   let walletService = new WalletService();
    //   await walletService.creditAmount(singleOrder.wallet_balance_used, singleOrder.cust_no, "cancelled order ID-" + singleOrder.order_id + " wallet balance refunded.");
    // }

    // send mail to the user
    const cust = await Customer.findOne({
      where: {
        cust_no: singleOrder.cust_no,
      },
    });
    let email = cust.email;
    // send email
    if (email !== null && validator.validate(email) == true) {
      sendCancelledByUserStatusEmail(email.toString(), singleOrder.order_id);
    }

    // send whatsapp
    sendOrderStatusToWhatsapp(
      cust.contact_no,
      singleOrder.order_id,
      "Cancelled"
    );

    return res.status(200).send({
      success: true,
      data: {
        updatedOrderStatus,
      },
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
  const { cust_no } = req;
  const order_id = req.params.orderId;
  const { items, return_reason } = req.body;

  try {
    if (!return_reason) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter a reason to return your order",
      });
    }

    const currentOrder = await Order.findOne({
      where: { cust_no, order_id },
    });

    if (!currentOrder) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested order not found for current user",
      });
    }

    // if (
    //   currentOrder.status !== "Delivered" ||
    //   currentOrder.return_status !== "i" ||
    //   currentOrder.return_status !== "r" ||
    //   currentOrder.return_status !== null
    // ) {
    //   return res.status(400).send({
    //     success: false,
    //     data: currentOrder.status,
    //     message: `This order cannot be returned because it is ${currentOrder.status} and the return status is ${currentOrder.return_status}`,
    //   });
    // }

    if (
      currentOrder.status == "Placed" ||
      currentOrder.status == "Accepted" ||
      currentOrder.status == "Shipped" ||
      currentOrder.status == "Returned" ||
      currentOrder.status == "Cancelled" ||
      currentOrder.return_status == "a" ||
      currentOrder.return_status == "c" ||
      currentOrder.return_status == "i"
    ) {
      return res.status(400).send({
        success: false,
        data: currentOrder.status,
        message: `This order cannot be returned because it is ${currentOrder.status} and the return status is ${currentOrder.return_status}`,
      });
    }
    if (items.length === 0) {
      return res.status(400).send({
        success: false,
        data: currentOrder,
        message: "Please enter the items you would like to return",
      });
    }

    items.map(async (currentItem) => {
      const selectedBatch = await Batch.findOne({
        where: { item_id: currentItem.id, mark_selected: 1 },
      });

      let item;
      if (selectedBatch) {
        item = await Inventory.findOne({
          where: {
            batch_id: selectedBatch.id,
            item_id: currentItem.id,
            location_id: 4,
            balance_type: 1,
          },
        });
      }

      await ReturnOrder.create({
        cust_no,
        order_id,
        item_id: currentItem.id,
        quantity: currentItem.quantity,
        cashback_amount: item ? item.cashback : null,
        is_percentage: item
          ? item.cashback_is_percentage === 1
            ? 1
            : null
          : null,
        created_by: 1,
        return_reason,
      });
    });

    await Order.update(
      {
        return_status: "i",
      },
      {
        where: { order_id, cust_no },
      }
    );

    const updatedOrder = await Order.findOne({
      where: { order_id, cust_no },
    });

    return res.status(200).send({
      success: true,
      data: updatedOrder,
      message: "Return initiated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
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

const getAllReturns = async (req, res, next) => {
  const { cust_no } = req;
  const { order_id } = req.body;
  try {
    const returnedItems = await ReturnOrder.findAll({
      where: { order_id, cust_no },
    });

    if (returnedItems.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "There are no returned items for this order",
      });
    }

    const promises = returnedItems.map(async (current) => {
      const currentItem = await Item.findAll({
        where: { id: current.item_id },
      });

      return {
        itemID: currentItem.id,
        itemName: currentItem.name,
        quantity: current.quantity,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Successfully fetched returned items and their quantity",
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
  getOrderByOrderId,
  cancelOrder,
  returnOrder,
  trackOrder,
  getAllReturns,
};
