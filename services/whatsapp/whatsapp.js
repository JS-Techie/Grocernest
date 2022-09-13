const Gupshup = require("gupshup-whatsapp-api");
const { optIn } = require("./optInOut");
const { getShortUrl } = require("../../services/urlShortener/urlShortener");
let client = new Gupshup({
  apiKey: "hm7797tb46hrtrgcsqksvxs69yj9zza4",
});

const sendOTPToWhatsapp = async (phno, otp) => {
  if (!phno) {
    return;
  }
  console.log("Sending OTP to whatsapp... ", otp);
  console.log(phno);

  const response = await Promise.resolve(optIn("91" + phno.toString()));
  console.log(response);
  if (response != 202)
    return res.status(400).send({
      success: false,
      data: "",
      message: "error occured while opt in whatsapp number",
    });

  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phno.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text:
          otp.toString() +
          " is your OTP(One Time Password) for Grocernest. For security reasons don't share the OTP.",
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
};

const sendInvoiceToWhatsapp = async (phno, order_id, link) => {
  console.log("Sending sms to whatsapp..");

  // sorten the link
  let short_url = "http://ecomm-dev.grocernest.com/api/invoice/" + await getShortUrl(link);
  // let short_url = "http://grocernest.com/api/url/invoice/download/" + await getShortUrl(link);

  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phno.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text:
          "Hi, Your order with order ID " +
          "*" +
          order_id +
          "*" +
          " is placed Successfully,  you can download your invoice by clicking this link " +
          short_url,
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
};

const sendOrderStatusToWhatsapp = (phno, order_id, status) => {
  console.log("Sending sms to whatsapp..");
  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phno.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text:
          "Your order with order ID " +
          "*" +
          order_id +
          "*" +
          " has been " +
          "*" +
          status +
          "*" +
          ".",
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
};

const sendOrderShippedToWhatsapp = (phno, order_id, delivery_boy) => {
  // Your order with order ID [123456] has been [Shipped]. Your order will be delivered by [Somename].

  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phno.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text:
          "Your order with order ID " +
          "*" +
          order_id +
          "*" +
          " has been " +
          "*" +
          "Shipped" +
          "*" +
          ". Your order will be delivered by " +
          "*" +
          delivery_boy +
          "*" +
          ".",
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
};

const sendAdminCancelledOrderStatusToWhatsapp = (
  phno,
  order_id,
  cancellation_reason
) => {
  // Your order with order ID [123456] has been canceled. Cancellation reason: [some issue]
  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phno.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text:
          "Your order with order ID " +
          "*" +
          order_id +
          "*" +
          " has been canceled. Cancellation reason: " +
          "*" +
          cancellation_reason +
          "*",
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
};

const sendDeliveryBoyNotificationToWhatsapp = (name, order_id, contact_no) => {
  // Hi! Shyam, a new delivery with order id- 123212 is assigned to you.
  client.message
    .send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + contact_no.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: "Hi! " + name + ", a new delivery with order id- " + order_id + " is assigned to you.",
      },
    })
    .then((response) => {
      console.log("Template message sent", response);
    })
    .catch((err) => {
      console.log("Template message err:", err);
    });
}

module.exports = {
  sendInvoiceToWhatsapp,
  sendDeliveryBoyNotificationToWhatsapp,
  sendOTPToWhatsapp,
  sendOrderStatusToWhatsapp,
  sendOrderShippedToWhatsapp,
  sendAdminCancelledOrderStatusToWhatsapp,
};
