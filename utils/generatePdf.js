const fs = require("fs");
const PDFDocument = require("pdfkit");
const getStream = require("get-stream")
const moment = require("moment");

const generatePdf = (invoice, path, start) => {
  let doc = new PDFDocument({ margin: 50 });
  doc.on('data', start)
  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(invoice, doc);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
  //   return await getStream.buffer(doc);
};

const generateHeader = (doc) => {
  doc
    .image("assets/logo.png", 50, 20, { width: 80 })
    .fillColor("#444444")
    .fontSize(10);
  // .text("330, M.G.Road, 1st floor", 200, 65, { align: "right" })
  // .text("Kabardanga More, Kolkata, 700104", 200, 80, { align: "right" })
  // .moveDown();
};

const generateCustomerInformation = (doc, invoice) => {
  doc
    .text(`Invoice Number: ${invoice.orderID}`, 50, 60)
    .text(`Invoice Date: ${moment(invoice.date).format("DD-MM-YYYY")}`, 50, 75)
    .text(`${invoice.customerName}`, 300, 60, { align: "right" })
    .text(invoice.address, 300, 75, { align: "right" })
    .moveDown();

  doc
    .font("Helvetica-Bold")
    .text(`Invoice total: ${invoice.total}`, 50, 95, { align: "center" });
};

function generateTableRow(doc, y, c1, c4, c5) {
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(c1, 50, y)
    .text(c4, 370, y, { width: 90, align: "center" })
    .text(c5, 0, y, { align: "right" });
}
function generateTableRow1(doc, y, c1, c4, c5) {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(c1, 50, y)
    .text(c4, 370, y, { width: 90, align: "center" })
    .text(c5, 0, y, { align: "right" });
}

function generateInvoiceTable(doc, invoice) {
  let i,
    invoiceTableTop = 130;
  const position = invoiceTableTop + 1 * 30;
  generateTableRow1(doc, position, "Item Name", "Quantity", "MRP");

  for (i = 0; i < invoice.orderItems.length; i++) {
    const item = invoice.orderItems[i];
    const position = invoiceTableTop + (i + 2) * 30;
    generateTableRow(
      doc,
      position,
      item.isGift === true ? `${item.itemName} (gift)` : item.itemName,
      item.quantity,
      item.MRP
    );
    generateHr(doc, position + 20);
  }
}

function generateFooter(invoice, doc) {
  doc
    .text(`Invoice Total: ${invoice.total}`, 50, 500)
    .text(`Payment Mode : Cash on Delivery`, 50, 520)
    .text(`Paid by wallet : Yet to add`, 50, 540)
    .moveDown();
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(570, y).stroke();
}

module.exports = { generatePdf };
