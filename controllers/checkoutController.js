const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const uniqid = require("uniqid");
const { generatePdf } = require("../utils/generatePdf");
const { uploadToS3, getFromS3 } = require("../services/s3Service");
const {
  sendInvoiceToWhatsapp,
  sendRegistrationWhatsapp,
} = require("../services/whatsapp/whatsapp");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Cart = db.CartModel;
const Wallet = db.WalletModel;
const Wallet_Transaction = db.WalletTransactionModel;
const OffersCache = db.OffersCacheModel;
const Offers = db.OffersModel;
const Batch = db.BatchModel;
const Item = db.ItemModel;
const Customer = db.CustomerModel;
const Inventory = db.InventoryModel;

const { sendOrderPlacedEmail } = require("../services/mail/mailService");

const concatAddress = require("../utils/concatAddress");

const checkoutFromCart = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  const {
    total,
    address_id,
    applied_discount,
    final_payable_amount,
    wallet_balance_used,
    wallet_id,
    cashback_amount,
  } = req.body;

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
      wallet_balance_used: wallet_balance_used,
      final_payable_amount: final_payable_amount,
      cashback_amount: cashback_amount,
    });

    const user_wallet = await Wallet.findOne({
      where: {
        cust_no: currentUser,
      },
    });

    if (wallet_balance_used > 0) {
      const wallet = await Wallet.update(
        {
          balance: user_wallet.balance - wallet_balance_used,
        },
        { where: { wallet_id: wallet_id } }
      );

      const wallet_transaction = await Wallet_Transaction.create({
        wallet_id: wallet_id,
        transaction_id: uniqid(),
        transaction_type: "D",
        transaction_amount: wallet_balance_used,
        transaction_details: newOrder.order_id,
        created_by: 2,
      });
    }

    let oldestBatch = null;
    const promises = cartForUser.map(async (currentItem) => {
      oldestBatch = await Batch.findOne({
        where: { item_id: currentItem.item_id, mark_selected: 1 },
      });

      if (!oldestBatch) {
        return res.status(200).send({
          success: true,
          data: [],
          message: "No batch is selected for current item",
        });
      }

      return {
        order_id: newOrder.order_id,
        item_id: currentItem.item_id,
        quantity: currentItem.quantity,
        created_by: newOrder.created_by,
        is_offer: currentItem.is_offer === 1 ? 1 : null,
        is_gift: currentItem.is_gift === 1 ? 1 : null,
        offer_price: currentItem.offer_item_price
          ? currentItem.offer_item_price
          : oldestBatch.sale_price,
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
      const oldestBatch = await Batch.findOne({
        where: { item_id: currentItem.item_id, mark_selected: 1 },
      });

      if (oldestBatch) {
        return {
          itemID: currentItem.item_id,
          quantity: currentItem.quantity,
          isOffer: currentItem.is_offer === 1 ? true : false,
          isGift: currentItem.is_gift === 1 ? true : false,
          salePrice:
            currentItem.is_offer === 1
              ? currentItem.offer_price
              : oldestBatch.sale_price,
          oldestBatch,
        };
      }
    });

    let orderItems = await Promise.all(orderItemsPromises);
    orderItems = orderItems.filter((current) => {
      return current !== undefined;
    });

    console.log(orderItems);

    //update inventory
    orderItems.map(async (currentItem) => {
      const currentInventory = await Inventory.findOne({
        where: {
          batch_id: currentItem.oldestBatch.id,
          item_id: currentItem.itemID,
          location_id: 4,
          balance_type: 1,
        },
      });
      console.log("Current item with balance type 1", currentInventory);
      const currentInventoryToBeBlocked = await Inventory.findOne({
        where: {
          batch_id: currentItem.oldestBatch.id,
          item_id: currentItem.itemID,
          location_id: 4,
          balance_type: 7,
        },
      });
      console.log(
        "Current inventory to be blocked",
        currentInventoryToBeBlocked
      );
      if (!currentInventoryToBeBlocked) {
        const newInventory = await Inventory.create({
          batch_id: currentItem.oldestBatch.id,
          item_id: currentItem.itemID,
          quantity: currentItem.quantity,
          location_id: 4,
          balance_type: 7,
          active_ind: "Y",
          created_by: 1,
        });

        console.log("No row with balance type 7", newInventory);
      } else {
        const updateInventory = await Inventory.update(
          {
            quantity:
              currentInventoryToBeBlocked.quantity + currentItem.quantity,
          },
          {
            where: {
              batch_id: currentItem.oldestBatch.id,
              item_id: currentItem.itemID,
              location_id: 4,
              balance_type: 7,
            },
          }
        );
        console.log("Yes row with balance type 7", updateInventory);
      }

      // if (currentInventory) {
      const updatedInventory = await Inventory.update(
        {
          quantity: currentInventory.quantity - currentItem.quantity, //error in this line
        },
        {
          where: {
            batch_id: currentItem.oldestBatch.id,
            item_id: currentItem.itemID,
            location_id: 4,
            balance_type: 1,
          },
        }
      );

      console.log(
        "updating main inventory with balance type 1",
        updatedInventory
      );
      // }
    });

    let email = "";
    let contact_no = "";
    Customer.findOne({
      where: {
        cust_no: currentUser,
      },
    }).then(async (cust) => {
      email = cust.dataValues.email;
      contact_no = cust.dataValues.contact_no;
      let opt_in = cust.dataValues.opt_in;

      await InvoiceGen(
        currentUser,
        newOrder.order_id,
        email,
        contact_no,
        opt_in
      );
    });

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
  const {
    itemID,
    quantity,
    total,
    address_id,
    applied_discount,
    final_payable_amount,
    wallet_balance_used,
    wallet_id,
    cashback_amount,
  } = req.body;

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
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id
      ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name
      from (((((t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_item.id = ${itemID} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 `);

    if (currentItemDetails.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Item details not found for item ID entered",
      });
    }

    const userGifts = await Cart.findAll({
      where: { cust_no: currentUser, is_gift: 1 },
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
      wallet_balance_used: wallet_balance_used,
      final_payable_amount: final_payable_amount,
      cashback_amount: cashback_amount,
    });

    const user_wallet = await Wallet.findOne({
      where: {
        cust_no: currentUser,
      },
    });

    if (wallet_balance_used > 0) {
      const wallet = await Wallet.update(
        {
          balance: user_wallet.balance - wallet_balance_used,
        },
        { where: { wallet_id: wallet_id } }
      );

      const wallet_transaction = await Wallet_Transaction.create({
        wallet_id: wallet_id,
        transaction_id: uniqid(),
        transaction_type: "D",
        transaction_amount: wallet_balance_used,
        transaction_details: newOrder.order_id,
        created_by: 2,
      });
    }

    let promises = [];
    if (userGifts.length !== 0) {
      promises = userGifts.map(async (current) => {
        return {
          order_id: newOrder.order_id,
          item_id: current.item_id,
          quantity: 1,
          created_by: newOrder.created_by,
          is_gift: 1,
        };
      });
    }

    const orderItems = await Promise.all(promises);

    const offer = await Offers.findOne({
      where: { is_active: 1, item_id: itemID },
    });

    const oldestBatch = await Batch.findOne({
      where: { item_id: itemID, mark_selected: 1 },
    });

    let newSalePrice = null;

    if (offer) {
      if (oldestBatch) {
        if (offer.is_percentage) {
          newSalePrice =
            oldestBatch.sale_price -
            (offer.amount_of_discount / 100) * oldestBatch.sale_price;
        } else {
          newSalePrice = oldestBatch.sale_price - offer.amount_of_discount;
        }
      }
    }

    orderItems.push({
      order_id: newOrder.order_id,
      item_id: itemID,
      quantity,
      created_by: newOrder.created_by,
      is_offer: offer ? 1 : null,
      offer_price: offer ? newSalePrice : null,
    });

    const offerItem = await OffersCache.findOne({
      where: { cust_no: currentUser },
    });

    let deletedFromCache;
    if (offerItem) {
      orderItems.push({
        order_id: newOrder.order_id,
        item_id: offerItem.item_id,
        quantity: offerItem.quantity,
        created_by: newOrder.created_by,
        is_offer: 1,
        offer_price: 0,
      });

      deletedFromCache = await OffersCache.destroy({
        where: { cust_no: currentUser },
      });
    }

    try {
      await OrderItems.bulkCreate(orderItems);
    } catch (error) {
      await Order.destroy({
        where: { cust_no: currentUser, order_id: newOrder.order_id },
      });

      return res.status(400).send({
        success: false,
        data: error.message,
        message:
          "Could not add items to DB, please check data field for more details",
      });
    }

    //update inventory
    orderItems.map(async (currentItem) => {
      const oldestBatch = await Batch.findOne({
        where: { item_id: currentItem.item_id, mark_selected: 1 },
      });

      let currentInventory;
      if (oldestBatch) {
        currentInventory = await Inventory.findOne({
          where: {
            batch_id: oldestBatch.id,
            item_id: currentItem.item_id,
            location_id: 4,
            balance_type: 1,
          },
        });

        console.log("current inventory with balance type 1", currentInventory);

        const currentInventoryToBeBlocked = await Inventory.findOne({
          where: {
            batch_id: oldestBatch.id,
            item_id: currentItem.item_id,
            location_id: 4,
            balance_type: 7,
          },
        });

        console.log(
          "blocked inventory with balance type 1",
          currentInventoryToBeBlocked
        );

        if (!currentInventoryToBeBlocked) {
          const newInventory = await Inventory.create({
            batch_id: oldestBatch.id,
            item_id: currentItem.item_id,
            location_id: 4,
            quantity: currentItem.quantity,
            balance_type: 7,
            active_ind: "Y",
            created_by: 1,
          });

          console.log(
            "If there is no inventory to be blocked, make a new row",
            newInventory
          );
        } else {
          const updatedInventory = await Inventory.update(
            {
              quantity:
                currentInventoryToBeBlocked.quantity + currentItem.quantity,
            },
            {
              where: {
                batch_id: oldestBatch.id,
                item_id: currentItem.item_id,
                location_id: 4,
                balance_type: 7,
              },
            }
          );

          console.log(
            "updated inventory row with balance type 7",
            updatedInventory
          );
        }
        // if (currentInventory) {
        const updateInventory = await Inventory.update(
          {
            quantity: currentInventory.quantity - currentItem.quantity,
          },
          {
            where: {
              batch_id: oldestBatch.id,
              item_id: currentItem.item_id,
              location_id: 4,
              balance_type: 1,
            },
          }
        );
        console.log(
          "updated inventory row with balance type 1",
          updateInventory
        );
        // }
      }
    });

    const response = orderItems.map((current) => {
      return {
        itemID: current.item_id,
        quantity: current.quantity,
        isGift: current.is_gift === 1 ? true : false,
        isOffer: current.is_offer === 1 ? true : false,
      };
    });

    // await InvoiceGen(currentUser, newOrder.order_id);

    console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
    let email = "";
    let contact_no = "";
    Customer.findOne({
      where: {
        cust_no: currentUser,
      },
    }).then(async (cust) => {
      email = cust.dataValues.email;
      contact_no = cust.dataValues.contact_no;
      let opt_in = cust.dataValues.opt_in;

      console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");

      let base_url = req.protocol + '://' + req.get('host');
      await InvoiceGen(
        currentUser,
        newOrder.order_id,
        email,
        contact_no,
        opt_in,
        base_url
      );
    });

    const deletedItemsFromCart = await Cart.destroy({
      where: { cust_no: currentUser, is_gift: 1 },
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
        deletedFromCache,
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

const InvoiceGen = async (cust_no, order_id, email, contact_no, opt_in, base_url) => {
  console.log("INVOICE GENNNN");
  const currentCustomer = cust_no;
  const orderID = order_id;
  try {
    const currentOrder = await Order.findOne({
      include: { model: OrderItems },
      where: { order_id: orderID, cust_no: currentCustomer },
    });

    if (!currentOrder) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No order found for current user and entered order ID",
      });
    }

    const currentUser = await Customer.findOne({
      where: { cust_no: currentCustomer },
    });

    const promises = currentOrder.t_order_items_models.map(async (current) => {
      const item = await Item.findOne({
        where: { id: current.item_id },
      });

      const oldestBatch = await Batch.findOne({
        where: { item_id: current.item_id, mark_selected: 1 },
      });

      if (oldestBatch) {
        return {
          itemName: item.name,
          quantity: current.quantity,
          MRP: oldestBatch ? oldestBatch.MRP : "",
          image: item.image,
          description: item.description,
          isGift: item.is_gift == 1 ? true : false,
          isOffer: item.is_offer == 1 ? true : false,
          offerPrice: item.is_offer == 1 ? offer_price : "",
          salePrice: oldestBatch.sale_price,
        };
      }
    });

    const resolved = await Promise.all(promises);

    const response = {
      customerName: currentUser.cust_name,
      orderID: currentOrder.order_id,
      status: currentOrder.status,
      address: currentOrder.address,
      total: currentOrder.total,
      date: currentOrder.created_at,
      payableTotal: currentOrder.final_payable_amount,
      walletBalanceUsed: currentOrder.wallet_balance_used,
      appliedDiscount: currentOrder.applied_discount,
      orderItems: resolved,
    };

    let writeStream = await generatePdf(
      response,
      `invoice-${currentOrder.order_id}.pdf`
    );
    let uploadResponse = null;
    writeStream.on("finish", async () => {
      console.log("stored pdf on local");

      // s3 upload
      uploadResponse = await uploadToS3(
        `invoice-${response.orderID}.pdf`,
        "pdfs/invoices/invoice-" + response.orderID + ".pdf"
      );
      console.log("stored on s3");
      const invoice_link = uploadResponse.Location;

      // console.log("final here==>>>", email, contact_no, invoice_link);

      // send email
      if (email != "") {
        sendOrderPlacedEmail(email, response.orderID);
      }
      // send whatsapp
      if (contact_no != "") {
        await sendInvoiceToWhatsapp(contact_no, response.orderID, invoice_link, base_url);
      }
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

module.exports = {
  checkoutFromCart,
  buyNow,
};
