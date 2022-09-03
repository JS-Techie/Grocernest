const { generatePdf } = require("../utils/generatePdf");
const fs = require("fs");
const db = require("../models");
const { uploadToS3 } = require("../services/s3Service");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Customer = db.CustomerModel;
const Inventory = db.InventoryModel;

const downloadInvoice = async (req, res, next) => {
  //Get current user from jwt
  const currentCustomer = req.cust_no;

  const { orderID } = req.body;

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
          salePrice: oldestBatch.sale_price
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
      `invoice-${response.orderID}.pdf`
    );

    writeStream.on("finish", async () => {
      console.log("stored pdf on local");
      let uploadResponse = await uploadToS3(
        `invoice-${response.orderID}.pdf`,
        "pdfs/invoices/invoice-" + response.orderID + ".pdf"
      );

      fs.unlinkSync(`invoice-${response.orderID}.pdf`);
      return res.status(200).send({
        success: true,
        data: {
          URL: uploadResponse.Location,
        },
        message: "Invoice generated successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Invoice not generated successfully",
    });
  }
};

module.exports = { downloadInvoice };