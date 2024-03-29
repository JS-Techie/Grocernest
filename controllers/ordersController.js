const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const WalletService = require("../services/walletService");
const {
  sendCancelledByUserStatusEmail,
} = require("../services/mail/mailService");
const validator = require("email-validator");

const SpecialWalletStrategy = db.SpecialWalletStrategy

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Offers = db.OffersModel;
const Inventory = db.InventoryModel;
const Customer = db.CustomerModel;
const ReturnOrder = db.ReturnOrdersModel;
const Cart = db.CartModel;

const { sendOrderStatusToWhatsapp } = require("../services/whatsapp/whatsapp");
const { getGifts } = require("../services/giftService");

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

      const deliveryDate = new Date(currentOrder.delivery_date)
      const dayCount = (new Date() - deliveryDate) / (1000 * 3600 * 24)



      const orderItems = await OrderItems.findAll({
        where: { order_id: currentOrder.order_id },
      });

      const orderItemPromises = orderItems.map(async (currentOrderItem) => {
        let currentOffer = null;
        let isEdit = null;
        currentOffer = await Offers.findOne({
          where: {
            is_active: 1,
            item_x: currentOrderItem.item_id,
            /*[Op.or]: [
              { item_id_1: currentOrderItem.item_id },
              { item_id: currentOrderItem.item_id },
            ]*/
            [Op.or]: [
              { type_id: 1 },
              { type_id: 2 }
            ],
            is_ecomm: 1,
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
        // if (offers.length !== 0) {
        //   offers.map((current) => {
        //     if (
        //       currentOrderItem.item_id === current.item_id_1 ||
        //       currentOrderItem.item_id === current.item_id_2
        //     ) {
        //       canReturn = false;
        //     }
        //   });
        // }

        if (currentOffer) {
          if (!currentOffer.amount_of_discount) {
            if (currentOffer.item_1_quantity <= currentOrderItem.quantity) {
              canReturn = false;
            }
          }
        }

        if (currentOrderItem.is_offer === 1) {
          canReturn = false;
        }

        if (oldestBatch) {
          return {
            itemName: currentItem.name,
            id: currentItem.id,
            image: currentItem.image,
            quantity: currentOrderItem.quantity,
            MRP: currentOrderItem.MRP,
            salePrice:
              currentOrderItem.is_offer === 1
                ? currentOrderItem.offer_price
                : currentOrderItem.sale_price,
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
                itemX: currentOffer.item_x ? currentOffer.item_x : "",
                quantityOfItemX: currentOffer.item_x_quantity
                  ? currentOffer.item_x_quantity
                  : "",
                itemY: currentOffer.item_y ? currentOffer.item_y : "",
                quantityOfItemY: currentOffer.item_y_quantity
                  ? currentOffer.item_y_quantity
                  : "",
                amountOfDiscount: currentOffer.amount_of_discount
                  ? currentOffer.amount_of_discount
                  : "",
                isPercentage: currentOffer.is_percentage ? true : false,
                isActive: currentOffer.is_active ? true : false,
              }
              : "",
          };
        }

        const specialwalletItemList= await SpecialWalletStrategy.findAll({
          attributes: ['items_list'],
          raw:true
        })
        console.log("the returned item list : ",specialwalletItemList)




      });

      const orderItemsArray = await Promise.all(orderItemPromises);
      const responseWithoutUndefined = orderItemsArray.filter((current) => {
        return current !== undefined;
      });

      // let orderTotal = 0;
      // orderItemsArray.map((current) => {
      //   orderTotal += current.quantity * current.MRP;
      // });

      const gifts = await getGifts(currentOrder.order_id);
      // console.log("the daycount of each item is : ", dayCount)
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
        reject_reason: currentOrder.reject_reason,
        pin: currentOrder.pin ? currentOrder.pin : "",
        gifts,
        dayCount:dayCount
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
      await sequelize.query(`select t_order.order_id, t_order.created_at,t_order.pin,t_order.status, t_order.return_status,t_item.id, t_item.name, t_order_items.quantity, t_item.image,
      t_order_items.is_offer, t_order_items.is_gift, t_order_items.offer_price
    from ((t_order
    inner join t_order_items on t_order_items.order_id = t_order.order_id)
    inner join t_item on t_item.id = t_order_items.item_id)
    where t_order.cust_no = "${currentUser}"
    AND 
    t_order.order_id = ${orderId}`);

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
          item_x: currentOrderItem.id,
          [Op.or]: [
            { type_id: 1 },
            { type_id: 2 }
          ],
          /* [Op.or]: [
             { item_id_1: currentOrderItem.id },
             { item_id: currentOrderItem.id },
           ],*/
          is_ecomm: 1,
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

      let canReturn = true;

      if (currentOffer || currentOrderItem.is_offer === 1) {
        canReturn = false;
      }

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
              itemX: currentOffer.item_x ? currentOffer.item_x : "",
              quantityOfItemX: currentOffer.item_x_quantity
                ? currentOffer.item_x_quantity
                : "",
              itemY: currentOffer.item_y ? currentOffer.item_y : "",
              quantityOfItemY: currentOffer.item_y_quantity
                ? currentOffer.item_y_quantity
                : "",
              itemID: currentOffer.item_x ? currentOffer.item_x : "",
              amountOfDiscount: currentOffer.amount_of_discount
                ? currentOffer.amount_of_discount
                : "",
              isPercentage: currentOffer.is_percentage ? true : false,
              isActive: currentOffer.is_active ? true : false,
            }
            : "",
          canReturn,
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
        pin: singleOrder[0].pin,
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
      currentOrder.return_status == "r" ||
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
      const currentItem = await Item.findOne({
        where: { id: current.item_id },
      });

      const selectedBatch = await Batch.findOne({
        where: { item_id: currentItem.id, mark_selected: 1 },
      });


      return {
        itemID: currentItem ? currentItem.id : "",
        itemName: currentItem ? currentItem.name : "",
        quantity: current.quantity,
        salePrice: selectedBatch ? selectedBatch.sale_price : "",
        MRP: selectedBatch ? selectedBatch.MRP : "",
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

const repeatOrder = async (req, res, next) => {
  const { cust_no } = req;
  const { order_id } = req.body;
  try {
    const currentOrder = await Order.findOne({
      where: { order_id, cust_no },
    });

    if (!currentOrder) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested order was not found for current customer",
      });
    }

    const orderItems = await OrderItems.findAll({
      where: { order_id },
    });

    if (orderItems.length === 0) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "There are no items in the requested order",
      });
    }

    //Aritrika add offer logic
    const cartArray = orderItems.map(async (currentItem) => {
      const itemDetails = await Item.findOne({
        where: { id: currentItem.item_id },
      });
      //In the following array make sure the offer item is also added to the cart
      return {
        cust_no,
        item_id: currentItem.item_id,
        quantity: currentItem.quantity,
        is_gift: itemDetails.is_gift,
        //is_offer :
        //offer_item_price :
        created_by: currentItem.created_by,
      };
    });

    const resolved = await Promise.all(cartArray);
    const addItemsToCart = await Cart.bulkCreate(resolved);

    return res.status(200).send({
      success: true,
      data: addItemsToCart,
      message: "Successfully added all the items of repeat order to cart",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
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
  repeatOrder,
};
