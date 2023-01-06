const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const blobStream = require("blob-stream");
const getStream = require("get-stream");
const moment = require("moment");

const { uploadToS3, getFromS3 } = require("../services/s3Service");

const generatePdf = async (invoice, path) => {
  let doc = new PDFDocument({ margin: 50 });
  let writeStream = fs.createWriteStream(path);
  doc.pipe(writeStream);

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(invoice, doc);
  doc.end();

  doc.on("end", () => {
    console.log("Generated PDF");
  });

  return writeStream;
};

const generateHeader = (doc) => {
  doc
    .image("assets/logo.png", 50, 20, { width: 80 })
    .fillColor("#444444")
    .fontSize(15);
  // .text("330, M.G.Road, 1st floor", 200, 65, { align: "right" })
  // .text("Kabardanga More, Kolkata, 700104", 200, 80, { align: "right" })
  // .moveDown();
};

const generateCustomerInformation = (doc, invoice) => {
  doc
    .text(`Invoice Number: ${invoice.orderID}`, 50, 60)
    .text(`Invoice Date: ${moment(invoice.date).format("DD-MM-YYYY")}`, 50, 75)
    .text(`${invoice.customerName}`, 300, 60, { align: "right" })
    // .text(`${invoice.customerName}`,{columns: 3,
    //   columnGap: 15,
    //   height: 100,
    //   width: 465,
    //   align: 'justify'})
    .text(`Contact No.: ${invoice.contactNo}`, 320, 75, { align: "right" })
    .text(invoice.address, 300, 90, { align: "right" })
    .moveDown();

  doc
    .font("Helvetica-Bold")
    .text(`Payable total: ${invoice.payableTotal}`, 50, 130, {
      align: "center",
    });
};

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc
    .font("Helvetica")
    .fontSize(15)
    .text(c1, 50, y)
    .text(c2, 250, y, { width: 90, align: "center" })
    .text(c3, 330, y, { width: 90, align: "center" })
    .text(c4, 410, y, { width: 90, align: "center" })
    .text(c5, 0, y, { align: "right" });
}
function generateTableRow1(doc, y, c1, c2, c3, c4, c5) {
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(c1, 50, y)
    .text(c2, 250, y, { width: 90, align: "center" })
    .text(c3, 330, y, { width: 90, align: "center" })
    .text(c4, 410, y, { width: 90, align: "center" })
    .text(c5, 0, y, { align: "right" });
}

function generateInvoiceTable(doc, invoice) {
  console.log("===================", invoice);

  let i,
    invoiceTableTop = 130;
  const position = invoiceTableTop + 1 * 30;
  generateTableRow1(
    doc,
    position,
    "Item Name",
    "Quantity",
    "MRP",
    "Sale Price",
    "Total"
  );

  const orderItems = invoice.orderItems.filter((currentItem) => {
    return currentItem != undefined;
  });

  console.log(orderItems);

  for (i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];

    console.log(item.salePrice);

    const position = invoiceTableTop + (i + 2) * 30;

    let salePrice = 0;
    let total = 0;
    if (!item.isGift && !item.isOffer) {
      salePrice = item.salePrice;
      total = salePrice * item.quantity;
    }

    let item_name = item.itemName;
    if (item_name.length > 15) {
      item_name = item.itemName.slice(0, 25) + "...";
    }
    generateTableRow(
      doc,
      position,
      item.isGift === true
        ? `${item_name} (Gift)`
        : item.isOffer === true
        ? `${item_name} (Offer)`
        : item_name,
      item.quantity,
      item.MRP,
      salePrice,
      total
    );
    generateHr(doc, position + 20);
  }
  generateTableRow(doc, position + 20, "TOTAL", " ", " ", " ", invoice.total);
}

function generateFooter(invoice, doc) {
  doc
    .text(`Delivery Charges : Free`, 50, 500)
    .text(`Paid by wallet : ${invoice.walletBalanceUsed}`, 50, 520)
    .text(
      `Paid By Amul Butter Wallet : ${invoice.itemBasedWalletBalanceUsed}`,
      50,
      540
    )
    .text(`Applied discount : ${invoice.appliedDiscount}`, 50, 560)
    .text(`Payment Mode : Cash on Delivery`, 50, 580)
    .text(`Total CGST : ${invoice.totalCGST.toFixed(2)}`, 390, 500)
    .text(`Total SGST : ${invoice.totalSGST.toFixed(2)}`, 390, 520)
    .text(`Total IGST : ${invoice.totalIGST.toFixed(2)}`, 390, 540)
    .text(`Total Other Tax : ${invoice.totalOtherTax.toFixed(2)}`, 390, 560)
    .text(
      `Total Taxes : ${(
        invoice.totalCGST +
        invoice.totalIGST +
        invoice.totalSGST +
        invoice.totalOtherTax
      ).toFixed(2)}`,
      390,
      580
    )
    .moveDown();
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(570, y).stroke();
}

module.exports = { generatePdf };
