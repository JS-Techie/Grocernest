const { generatePdf } = require("../utils/generatePdf");
const db = require("../models");
const StreamTransport = require("nodemailer/lib/stream-transport");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Customer = db.CustomerModel;

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

      const batches = await Batch.findAll({
        where: { item_id: current.item_id },
        order: [["created_at", "ASC"]],
      });

      let oldestBatch;
      if (batches.length !== 0) {
        oldestBatch = batches[0];
      }

      return {
        itemName: item.name,
        quantity: current.quantity,
        MRP: oldestBatch ? oldestBatch.MRP : "",
        image: item.image,
        description: item.description,
        isGift: item.is_gift == 1 ? true : false,
      };
    });

    const resolved = await Promise.all(promises);

    const response = {
      customerName: currentUser.cust_name,
      orderID: currentOrder.order_id,
      status: currentOrder.status,
      address: currentOrder.address,
      total: currentOrder.total,
      date: currentOrder.created_at,
      orderItems: resolved,
    };

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment;filename=invoice.pdf",
    });

    generatePdf(response, "invoice.pdf", (chunk) => {
      console.log(chunk);
      stream.write(chunk);
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Invoice not generated successfully",
    });
  }
};

module.exports = { downloadInvoice };
