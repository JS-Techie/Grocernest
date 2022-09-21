const { sequelize } = require("../../models");
const { Op } = require("sequelize");
const db = require("../../models");

const {
  sendOrderStatusEmail,
  sendCancelledStatusEmail,
} = require("../../services/mail/mailService");
const WalletService = require("../../services/walletService");

// whatsapp
const {
  sendOrderStatusToWhatsapp,
  sendOrderShippedToWhatsapp,
  sendAdminCancelledOrderStatusToWhatsapp,
  sendPickupBoyNotificationToWhatsapp,
} = require("../../services/whatsapp/whatsapp");
// const Customer = db.CustomerModel;

const Batch = db.BatchModel;
const Customer = db.CustomerModel;
const Item = db.ItemModel;
const Inventory = db.InventoryModel;
const Category = db.LkpCategoryModel;
const Offers = db.OffersModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const User = db.UserModel;
const ReturnOrder = db.ReturnOrdersModel;
const Coupon = db.CouponsModel;

const getAllPendingOrders = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Placed"
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No items found based on search term",
      });
    }

    const promises = results.map(async (current) => {
      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        total: current.total,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all pending orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all pending orders",
    });
  }
};

const getAllOrderByPhoneNumber = async (req, res, next) => {
  const phno = req.body.phno;
  const orderType = req.body.orderType;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const orderid = req.body.orderId;

  const phoneNoQuery =
    phno == undefined || phno == ""
      ? ""
      : " AND tc.contact_no LIKE '%" + phno + "%'";
  const dateQuery =
    startDate == undefined ||
    startDate == "" ||
    endDate == undefined ||
    endDate == ""
      ? ""
      : " AND tlo.created_at BETWEEN '" +
        startDate +
        "' AND (SELECT DATE_ADD('" +
        endDate +
        "', INTERVAL 1 DAY))";
  const orderId =
    orderid == undefined || orderid == ""
      ? ""
      : " AND tlo.order_id LIKE '%" + orderid + "%'";

  // console.log(phno, orderType);

  try {
    const [results, metadata] = await sequelize.query(`
            select tc.cust_name, 
            tlo.cust_no , 
            tc.contact_no, 
            tlo.order_id,
            tlo.status,
            tlo.created_at,
            tlo.created_by,
            tlo.total,
            delivery_boy,
            tlo.cancellation_reason,
            tlo.applied_discount,
            tlo.wallet_balance_used,
            tlo.final_payable_amount
            from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="${orderType}"
            ${phoneNoQuery}
            ${dateQuery}
            ${orderId}
             order by created_at DESC
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No items found based on search term",
      });
    }

    const promises = results.map(async (current) => {
      const dboy_name = await User.findOne({
        where: {
          id: current.delivery_boy,
          type_cd: "DELIVERY_BOY",
        },
      });
      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        transporter_name: dboy_name ? dboy_name.full_name : "",
        cancellation_reason: current.cancellation_reason,
        total: current.total,
        applied_discount: current.applied_discount,
        wallet_balance_used: current.wallet_balance_used,
        final_payable_amount: current.final_payable_amount,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all pending orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all pending orders",
    });
  }
};

const getOrderDetails = async (req, res, next) => {
  //Get currentUser from req.cust_no

  // const currentUser = req.cust_no;

  //Get order id from req.params
  const orderId = req.body.orderId;

  try {
    //Get that order according to its id

    const [cust_result, metadata2] = await sequelize.query(
      `
            select 
            tc.id ,
            tc.cust_no ,
            tc.cust_name ,
            tlo.address ,
            tc.email ,
            tc.contact_no ,
            tc.comments 
            from t_customer tc inner join t_lkp_order tlo 
            where
            tc.cust_no = tlo.cust_no and
            tlo.order_id = "${orderId}"
            `
    );

    const [singleOrder, metadata] = await sequelize.query(`
      select t_lkp_order.order_id, t_lkp_order.created_at, t_lkp_order.status, t_item.id, t_item.name, t_order_items.quantity, t_item.image,
      t_order_items.is_offer, t_order_items.is_gift, t_order_items.offer_price,t_lkp_order.cashback_amount
    from ((t_lkp_order
    inner join t_order_items on t_order_items.order_id = t_lkp_order.order_id)
    inner join t_item on t_item.id = t_order_items.item_id)
    where t_lkp_order.order_id = ${orderId}`);

    if (singleOrder.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not fetch requested order for the current user",
      });
    }

    console.log(singleOrder);

    const promises = singleOrder.map(async (currentOrderItem) => {
      let currentOffer = null;
      let isEdit = null;
      if (currentOrderItem.is_offer === 1) {
        currentOffer = await Offers.findOne({
          where: {
            is_active: 1,
            [Op.or]: [
              { item_id_1: currentOrderItem.id },
              { item_id: currentOrderItem.id },
            ],
          },
        });
        if (currentOffer) {
          if (currentOffer.amount_of_discount) {
            isEdit = true;
          }
        }
      }

      console.log("===============================", currentOffer);
      const currentItem = await Item.findOne({
        where: { id: currentOrderItem.id },
      });

      const category = await Category.findOne({
        where: { id: currentItem.category_id },
      });

      const oldestBatch = await Batch.findOne({
        where: { item_id: currentOrderItem.id, mark_selected: 1 },
      });

      if (oldestBatch) {
        return {
          itemName: currentItem.name,
          id: currentItem.id,
          category: category ? category.group_name : "",
          itemCd: currentItem.item_cd,
          image: currentItem.image,
          isGift: currentItem.is_gift == 1 ? true : false,
          quantity: currentOrderItem.quantity,
          MRP: oldestBatch.MRP,
          salePrice: currentOffer
            ? currentOffer.amount_of_discount
              ? currentOrderItem.offer_price
              : oldestBatch.sale_price
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
        cashbackAmount: singleOrder[0].cashback_amount
          ? singleOrder[0].cashback_amount
          : 0,
        orderID: singleOrder[0].order_id,
        Date: singleOrder[0].created_at,
        status: singleOrder[0].status,
        orderTotal,
        itemDetails: responseArray,
        customer_details: cust_result[0],
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

const getOrderDetails_unused = async (req, res, next) => {
  const orderId = req.body.orderId;
  // console.log("get order details", orderId);

  try {
    const [results, metadata] = await sequelize.query(`
            select 
            toi.item_id,ti.name,toi.quantity,ti.item_cd,ti.units,ti.UOM,
            tlc.group_name as category,
            tlsc.sub_cat_name as subcategory,
            toi.is_gift,
            ti.brand_id ,ti.div_id, ti.department_id ,ti.size_id,ti.description,
            null as type, null as amount_of_discount, null as is_percentage, 
            null as offer_item_id, 
            null as item_id_1,
            null as item_id_2,
            null as item_1_quantity,
            null as item_2_quantity,
            'false' as is_offer
            from t_order_items toi
            inner join t_item ti 
            inner join t_lkp_category tlc 
            inner join t_lkp_sub_category tlsc 
            inner join t_offers to2 
            WHERE toi.order_id = "${orderId}" 
            AND ti.id = toi.item_id 
            and tlc.id = ti.category_id 
            and tlsc.id = ti.sub_category_id 

            union
            
            select 
            toi.item_id,ti.name,toi.quantity,ti.item_cd,ti.units,ti.UOM,
            tlc.group_name as category,
            tlsc.sub_cat_name as subcategory,
            toi.is_gift,
            ti.brand_id ,ti.div_id, ti.department_id ,ti.size_id,ti.description,
            to2.type,to2.amount_of_discount, to2.is_percentage, 
            to2.item_id as offer_item_id, to2.item_id_1 ,to2.item_id_2 ,to2.item_1_quantity ,to2.item_2_quantity,
            'true' as is_offer 
            from t_order_items toi
            inner join t_item ti 
            inner join t_lkp_category tlc 
            inner join t_lkp_sub_category tlsc 
            inner join t_offers to2 
            WHERE toi.order_id = "${orderId}" 
            AND ti.id = toi.item_id 
            and tlc.id = ti.category_id 
            and tlsc.id = ti.sub_category_id 
            and (to2.item_id = toi.item_id
            or to2.item_id_1  = toi.item_id
            )
          `);

    const [cust_result, metadata2] = await sequelize.query(
      `
            select 
            tc.id ,
            tc.cust_no ,
            tc.cust_name ,
            tlo.address ,
            tc.email ,
            tc.contact_no ,
            tc.comments 
            from t_customer tc inner join t_lkp_order tlo 
            where
            tc.cust_no = tlo.cust_no and
            tlo.order_id = "${orderId}"
            `
    );

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No items found based on search term",
      });
    }

    const promises = results.map(async (current) => {
      const oldestBatch = await Batch.findOne({
        where: { item_id: current.item_id, mark_selected: 1 },
      });

      // const oldestBatch = batches[0];

      if (oldestBatch) {
        return {
          item_id: current.item_id,
          name: current.name,
          quantity: current.quantity,
          item_cd: current.item_cd,
          units: current.units,
          UOM: current.UOM,
          category: current.category,
          subcategory: current.subcategory,
          brand_id: current.brand_id,
          div_id: current.div_id,
          department_id: current.department_id,
          size_id: current.size_id,
          description: current.description,
          cost_price: oldestBatch.cost_price,
          sale_price: oldestBatch.sale_price,
          MRP: oldestBatch.MRP,
          discount: oldestBatch.discount,
          // is_free: oldestBatch.sale_price === 0 ? true : false,
          is_offer: current.is_offer === 1 ? true : false,
          is_gift: current.is_gift === 1 ? true : false,
          can_edit: current.amount_of_discount ? true : false,

          type: current.type,
          amount_of_discount: current.amount_of_discount,
          is_percentage: current.amount_of_discount
            ? current.is_percentage === 1
              ? true
              : false
            : "",
          offer_item_id: current.offer_item_id,
          item_id_1: current.item_id_1,
          item_id_2: current.item_id_2,
          item_1_quantity: current.item_1_quantity,
          item_2_quantity: current.item_2_quantity,
        };
      }
    });

    //Free item is item_id_2 in offers not is_free flag from batch

    const resolvedArray = await Promise.all(promises);

    const responseArray = [
      ...new Map(resolvedArray.map((item) => [item["item_id"], item])).values(),
    ];

    console.log("resolvedArray", resolvedArray);
    console.log("responseArray", responseArray);

    return res.status(200).send({
      success: true,
      data: {
        customer_details: cust_result[0],
        order_item_details: responseArray,
      },
      message: "Successfully fetched all items of this order",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching items for this order",
    });
  }
};

const changeOrderStatus = async (req, res, next) => {
  console.log("change order status");

  let wallet_balance_used = 0;
  let orderId = req.body.orderId;
  let cancellationReason = req.body.cancellataionReason
    ? req.body.cancellataionReason
    : "";
  // console.log("cancellationReason", cancellationReason);

  const order = await Order.findOne({
    where: { order_id: orderId },
  });

  if (order.status === "Cancelled") {
    return res.status(200).send({
      success: false,
      data: "",
      message: "This order is already cancelled",
    });
  }

  Order.update(
    {
      status: req.body.status,
      cancellation_reason: cancellationReason,
      updated_at: new Date(),
    },
    { where: { order_id: req.body.orderId } }
  )
    .then((result) => {
      Order.findOne({
        where: {
          order_id: req.body.orderId,
        },
      }).then((res) => {
        // wallet_balance_used = res.dataValues.wallet_balance_used;
        if (
          req.body.status === "Accepted" ||
          req.body.status === "Delivered" ||
          req.body.status === "Cancelled"
        ) {
          OrderItems.findAll({
            where: {
              order_id: res.dataValues.order_id,
            },
          }).then(async (res2) => {
            if (req.body.status === "Cancelled") {
              // if order cancelled give user the deducted wallet balance
              if (res.dataValues.wallet_balance_used != 0) {
                console.log("add the deducted balance to the user wallet");
                let walletService = new WalletService();
                let result = await walletService.creditAmount(
                  res.dataValues.wallet_balance_used,
                  res.dataValues.cust_no,
                  "cancelled order ID-" +
                    req.body.orderId +
                    " wallet balance refunded."
                );
              }
            }

            // console.log(res2);
            res2.map((currentItem) => {
              console.log("Item id=>>", currentItem.item_id);
              Item.findOne({
                where: {
                  id: currentItem.item_id,
                },
              }).then(async (item) => {
                Batch.findOne({
                  where: {
                    item_id: item.id,
                    mark_selected: 1,
                  },
                }).then(async (batch) => {
                  if (!batch) {
                    return res.status(200).send({
                      success: true,
                      data: "",
                      message: "Successfully changed order status",
                    });
                  }

                  //TODO update inventory table quantity as well

                  if (req.body.status == "Cancelled") {
                    const itemsInOrder = await OrderItems.findAll({
                      where: { order_id: res.dataValues.order_id },
                    });
                    if (itemsInOrder.length > 0) {
                      itemsInOrder.map(async (currentItem) => {
                        const oldestBatch = await Batch.findOne({
                          where: {
                            item_id: currentItem.item_id,
                            mark_selected: 1,
                          },
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
                            },
                          });

                          if (blockedInventory) {
                            updateBlockedItem = await Inventory.update(
                              {
                                quantity:
                                  blockedInventory.quantity -
                                  currentItem.quantity,
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
                              quantity:
                                currentItem.quantity +
                                currentInventory.quantity,
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
                  } else if (req.body.status == "Delivered") {
                    const current_inventory_to_be_blocked =
                      await Inventory.findOne({
                        where: {
                          item_id: batch.item_id,
                          batch_id: batch.id,
                          balance_type: 7,
                        },
                      });
                    await Inventory.update(
                      {
                        quantity:
                          current_inventory_to_be_blocked.quantity -
                          currentItem.quantity,
                      },
                      {
                        where: {
                          batch_id: batch.id,
                          item_id: batch.item_id,
                          balance_type: 7,
                        },
                      }
                    );
                  }
                });
              });
            });
          });
        }

        Customer.findOne({
          where: {
            cust_no: res.dataValues.cust_no,
          },
        }).then((cust) => {
          let email = cust.dataValues.email;
          if (email !== null)
            if (req.body.status === "Cancelled") {
              // email
              sendCancelledStatusEmail(
                email.toString(),
                req.body.orderId,
                req.body.cancellataionReason
              );
              // whatsapp for ADMIN cancelled order
              sendAdminCancelledOrderStatusToWhatsapp(
                cust.contact_no,
                req.body.orderId,
                req.body.cancellataionReason
              );
            } else {
              //email for cancelled by user
              sendOrderStatusEmail(
                email.toString(),
                req.body.orderId,
                "Your order " +
                  req.body.orderId +
                  " has been " +
                  req.body.status
              );
              // whatsapp for cancelled by user
              sendOrderStatusToWhatsapp(
                cust.contact_no,
                req.body.orderId,
                req.body.status
              );
            }
        });
      });

      return res.status(200).send({
        success: true,
        data: { status: req.body.status },
        message: "Successfully changed order status",
      });
    })
    .catch((err) => {
      return res.status(400).send({
        success: false,
        data: err.message,
        message: "Error occurred while changing the order status",
      });
    });
};

const acceptedOrders = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Accepted"
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No orders found",
      });
    }

    const promises = results.map(async (current) => {
      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        total: current.total,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all accepted orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all accepted orders",
    });
  }
};

const assignTransporter = async (req, res, next) => {
  let orderId = req.body.orderId;
  let transporterName = req.body.delivery_boy;

  const deliveryBoy = await User.findOne({
    where: {
      id: transporterName,
    },
  });
  Order.update(
    {
      status: "Shipped",
      delivery_boy: parseInt(transporterName),
    },
    { where: { order_id: orderId } }
  )
    .then((result) => {
      Order.findOne({
        where: {
          order_id: req.body.orderId,
        },
      }).then((res) => {
        let cust_no = res.dataValues.cust_no;
        Customer.findOne({
          where: {
            cust_no: res.dataValues.cust_no,
          },
        }).then((cust) => {
          // send email shipped order
          let email = cust.dataValues.email;
          if (email !== null)
            sendOrderStatusEmail(
              email.toString(),
              req.body.orderId,
              "Your order " +
                req.body.orderId +
                " has been Shipped. Your order will be delivered by " +
                deliveryBoy.full_name.toString()
            );

          // send whatsapp
          let contact_no = cust.dataValues.contact_no;
          // let opt_in = cust.dataValues.opt_in;

          // if (opt_in == 1) {
          sendOrderShippedToWhatsapp(
            contact_no,
            req.body.orderId,
            deliveryBoy.full_name.toString()
          );
          // }
        });
      });

      return res.status(200).send({
        success: true,
        data: { status: "Shipped" },
        message: "Order successfully shipped",
      });
    })
    .catch((error) => {
      return res.status(400).send({
        success: false,
        data: error.message,
        message: "Error while assigning transporter name",
      });
    });
};

const getShippedOrders = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
            select delivery_boy, tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Shipped"
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No orders found",
      });
    }

    const promises = results.map(async (current) => {
      const dboy_name = await User.findOne({
        where: {
          id: current.delivery_boy,
          type_cd: "DELIVERY_BOY",
        },
      });
      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        total: current.total,
        transporterName: dboy_name ? dboy_name.full_name : "",
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all shipped orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all shipped orders",
    });
  }
};

const getDeliveredOrders = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total, delivery_boy from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Delivered"
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No orders found",
      });
    }

    const promises = results.map(async (current) => {
      //Get delivery boy name and pass it in transportterName field
      const dboy_name = await User.findOne({
        where: {
          id: current.delivery_boy,
          type_cd: "DELIVERY_BOY",
        },
      });
      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        total: current.total,
        transporterName: dboy_name ? dboy_name.full_name : "",
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all delivered orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all delivered orders",
    });
  }
};

const getCanceledorders = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total, delivery_boy,tlo.cancellation_reason from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Cancelled"
          `);

    if (results.length === 0) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "No orders found",
      });
    }

    const promises = results.map(async (current) => {
      //Find transporterName and pass it

      const dboy_name = await User.findOne({
        where: {
          id: current.delivery_boy,
          type_cd: "DELIVERY_BOY",
        },
      });

      return {
        cust_name: current.cust_name,
        contact_no: current.contact_no,
        cust_no: current.cust_no,
        order_id: current.order_id,
        status: current.status,
        created_at: current.created_at,
        created_by: current.created_by,
        total: current.total,
        transporterName: dboy_name ? dboy_name.full_name : "",
        cancellation_reason: current.cancellation_reason,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully fetched all canceled orders",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching all canceled orders",
    });
  }
};

const assignDeliveryBoyForReturn = async (req, res, next) => {
  const { order_id } = req.params;
  const { delivery_boy } = req.body;

  try {
    const currentOrder = await ReturnOrder.findAll({
      where: { order_id },
    });

    if (currentOrder.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Could not find requested order",
      });
    }

    await Order.update(
      {
        delivery_boy,
      },
      {
        where: { order_id },
      }
    );

    const currentDeliveryBoy = await User.findOne({
      where: { id: delivery_boy },
    });

    sendPickupBoyNotificationToWhatsapp(
      currentDeliveryBoy.full_name.toString(),
      order_id.toString(),
      currentDeliveryBoy.mobile_no.toString()
    );

    const updatedOrder = await ReturnOrder.findAll({
      where: { order_id },
    });

    return res.status(200).send({
      success: true,
      data: updatedOrder,
      message: "Assigned requested delivery boy successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const rejectRequestedReturn = async (req, res, next) => {
  const { order_id } = req.params;
  const { reject_reason } = req.body;

  try {
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

    await Order.update(
      {
        return_status: "c",
        reject_reason,
      },
      {
        where: { order_id },
      }
    );

    //Delete all records from return orders table which has order id

    await ReturnOrder.destroy({
      where: { order_id },
    });

    const updatedOrder = await Order.findOne({
      where: { order_id },
    });

    //Notify customer about status of return reject

    return res.status(200).send({
      success: true,
      data: updatedOrder,
      message: "Successfully rejected requested return",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getReturns = async (req, res, next) => {
  const { return_status } = req.body;
  try {
    const allOrders = await Order.findAll({
      where: { return_status },
    });

    let returnDate = null;

    if (allOrders.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no returns based on the return status",
      });
    }

    const outerPromises = await allOrders.map(async (currentOrder) => {
      const returnedItems = await ReturnOrder.findAll({
        where: { order_id: currentOrder.order_id },
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
            returnDate = currentReturnedItem.created_at;

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
          orderedDate: currentOrder.created_at,
          returnDate,
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
      message: "Found all requested returns",
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
  getAllPendingOrders,
  getOrderDetails,
  changeOrderStatus,
  acceptedOrders,
  assignTransporter,
  getShippedOrders,
  getDeliveredOrders,
  getCanceledorders,
  getAllOrderByPhoneNumber,
  assignDeliveryBoyForReturn,
  rejectRequestedReturn,
  getReturns,
};
