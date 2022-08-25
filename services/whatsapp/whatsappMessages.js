const Gupshup = require("gupshup-whatsapp-api");

let client = new Gupshup({
  apiKey: "hm7797tb46hrtrgcsqksvxs69yj9zza4",
});

const sendCouponToUser = async (
  firstName,
  couponCode,
  isPercentage,
  amountOfDiscount,
  phoneNumber
) => {
  try {
    const off =
      parseInt(isPercentage) === 1
        ? `${parseInt(amountOfDiscount)}%`
        : `${parseInt(amountOfDiscount)}`;


        console.log(off);

    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi, [Tanmoy]. Apply coupon [FIRSTBUY] to receive [20%] off on your next order.`,
      },
    });

    console.log("Success Response", messageResponseFromGupshup);
  } catch (error) {
    console.error("Error Response", error);
  }
};

const sendFirstCouponToUser = async (firstName, phoneNumber, couponCode) => {
  try {
    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi ${firstName}, thanks for using Grocernest. Use coupon ${couponCode} to get 10% off on your next order. We value your interest in us.`,
      },
    });
    console.log("Success Response", messageResponseFromGupshup);
  } catch (error) {
    console.error("Error Response", error);
  }
};

const sendOfferToUser = async (
  firstName,
  XItem,
  XQuantity,
  YItem,
  YQuantity,
  isPercentage,
  amountOfDiscount
) => {
  try {
    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi, ${firstName}. We have a new offer. Buy ${XQuantity} of ${XItem} and get ${
          YItem
            ? YQuantity + " " + YItem
            : isPercentage
            ? amountOfDiscount + "% off"
            : "Rs " + amountOfDiscount + " off"
        }`,
      },
    });
    console.log("Success Response", messageResponseFromGupshup);
  } catch (error) {
    console.error("Error Response", error);
  }
};

const sendPOSInvoiceToUser = async (link, orderId, phoneNumber) => {
  try {
    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi, Your order with order ID ${orderId} is placed Successfully, you can download your invoice by clicking this link ${link}`,
      },
    });
    console.log("Success Response", messageResponseFromGupshup);
  } catch (error) {
    console.error("Error Response", error);
  }
};

module.exports = {
  sendCouponToUser,
  sendOfferToUser,
  sendPOSInvoiceToUser,
  sendFirstCouponToUser,
};
