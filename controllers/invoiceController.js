const { generatePdf } = require("../utils/generatePdf");
const fs = require("fs");
const db = require("../models");
const { uploadToS3, checkIfFileExists } = require("../services/s3Service");

const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Customer = db.CustomerModel;
const Inventory = db.InventoryModel;
const Url = db.UrlModel;
const TaxInfo = db.ItemTaxInfoModel;
const Coupon = db.CouponsModel;

const downloadInvoice = async (req, res, next) => {
  //Get current user from jwt
  const currentCustomer = req.cust_no;

  let totalCGST = 0;
  let totalIGST = 0;
  let totalSGST = 0;
  let totalOtherTax = 0;

  const { orderID } = req.body;

  try {
    const exists = await checkIfFileExists(
      `pdfs/invoices/invoice-${orderID}.pdf`
    );

    console.log("File exists=====>", exists);

    if (exists) {
      return res.status(200).send({
        success: true,
        data: {
          URL: `https://ecomm-dev.s3.ap-south-1.amazonaws.com/pdfs/invoices/invoice-${orderID}.pdf`,
        },
        message: "Invoice generated successfully",
        devMessage: "Invoice already exists",
      });
    }

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

    let currentCoupon;
    if (currentOrder.coupon_id) {
      currentCoupon = await Coupon.findOne({
        where: { id: currentOrder.coupon_id },
      });
    }

    const promises = currentOrder.t_order_items_models.map(async (current) => {
      const item = await Item.findOne({
        where: { id: current.item_id },
      });
      const currentQuantity = await OrderItems.findOne({
        where: { quantity: current.quantity },
      });

      // const oldestBatch = await Batch.findOne({
      //   where: { item_id: current.item_id, mark_selected: 1 },
      // });
      const oldestBatch = await OrderItems.findOne({
        where: {item_id:currentOrder.item_id}
      })

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
      appliedCoupon: currentCoupon ? currentCoupon.code : null,

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

const getOriginalUrl = async (req, res, next) => {
  let id = req.params.id.toString();

  const current_url = await Url.findOne({
    where: { id: id },
  });

  if (current_url == null) {
    return res.send("<center><h3>This url does not exist..</h3></center>");
  }
  return res.redirect(current_url.original_url);
};
module.exports = { downloadInvoice, getOriginalUrl };
