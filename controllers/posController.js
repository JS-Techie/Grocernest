const { sendInvoiceToWhatsapp } = require("../services/whatsapp/whatsapp");

const sendInvoice = async (req, res, next) => {
  const { url, phoneNumber, orderId } = req.body;

  try {
    sendInvoiceToWhatsapp(phoneNumber, orderId, url);

    return res.status(200).send({
      success: true,
      data: [],
      message: "Successfully sent invoice to customer phone number",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Could not send invoice to user, check data field for more details",
    });
  }
};

module.exports = { sendInvoice };
