const { generatePdf } = require("../../utils/generatePdf");
const fs = require("fs");
const db = require("../../models");
const { uploadToS3 } = require("../../services/s3Service");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Customer = db.CustomerModel;
const TaxInfo = db.ItemTaxInfoModel;

const downloadEcommInvoice = async (req, res, next) => {
  const orderID = req.body.order_id;

  let totalCGST = 0;
  let totalIGST = 0;
  let totalSGST = 0;
  let totalOtherTax = 0;

  try {
    const currentOrder = await Order.findOne({
      include: { model: OrderItems },
      where: { order_id: orderID },
    });

    console.log("currentOrder", currentOrder.cust_no);
    if (!currentOrder) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No order found for current user and entered order ID",
      });
    }

    const currentUser = await Customer.findOne({
      where: { cust_no: currentOrder.cust_no },
    });

    const promises = currentOrder.t_order_items_models.map(async (current) => {
      const item = await Item.findOne({
        where: { id: current.item_id },
      });

      const currentQuantity = await OrderItems.findOne({
        where: { quantity: current.quantity },
      });

      const oldestBatch = await Batch.findOne({
        where: { item_id: current.item_id, mark_selected: 1 },
      });

      if (oldestBatch) {
        const currentTaxArray = await TaxInfo.findAll({
          where: { item_id: current.item_id },
        });

        currentTaxArray.map((currentTax) => {
          switch (currentTax.tax_type) {
            case "CGST":
              totalCGST +=
                (currentTax.tax_percentage / 100) *
                oldestBatch.sale_price *
                currentQuantity.quantity;
              break;
            case "SGST":
              totalSGST +=
                (currentTax.tax_percentage / 100) *
                oldestBatch.sale_price *
                currentQuantity.quantity;
              break;
            case "IGST":
              totalIGST +=
                (currentTax.tax_percentage / 100) *
                oldestBatch.sale_price *
                currentQuantity.quantity;
              break;
            case "OTHERS":
              totalOtherTax +=
                (currentTax.tax_percentage / 100) *
                oldestBatch.sale_price *
                currentQuantity.quantity;
              break;
            default:
              break;
          }
        });

        return {
          itemName: item.name,
          quantity: current.quantity,
          MRP: oldestBatch ? oldestBatch.MRP : "",
          image: item.image,
          description: item.description,
          isGift: item.is_gift == 1 ? true : false,
          isOffer: current.is_offer == 1 ? true : false,
          offerPrice: current.is_offer == 1 ? current.offer_price : "",
          salePrice: oldestBatch.sale_price,
        };
      }
    });

    const resolved = await Promise.all(promises);

    const response = {
      customerName: currentUser.cust_name,
      contactNo: currentUser.contact_no,
      orderID: currentOrder.order_id,
      status: currentOrder.status,
      address: currentOrder.address,
      total: currentOrder.total,
      date: currentOrder.created_at,
      payableTotal: currentOrder.final_payable_amount,
      walletBalanceUsed: currentOrder.wallet_balance_used
        ? currentOrder.wallet_balance_used
        : 0,
      itemBasedWalletBalanceUsed: currentOrder.item_wallet_used
        ? currentOrder.item_wallet_used
        : 0,
      appliedDiscount: currentOrder.applied_discount,

      orderItems: resolved,
      totalSGST,
      totalCGST,
      totalIGST,
      totalOtherTax,
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

module.exports = { downloadEcommInvoice };
