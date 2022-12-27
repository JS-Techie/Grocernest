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
        : `₹${parseInt(amountOfDiscount)}`;

    console.log(off);

    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi, ${firstName}. Apply coupon *${couponCode}* to receive *${off}* off on your next order. `,
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

const sendNotificationsToUser = async (itemName, phoneNumber, custName) => {
  const firstName = custName.split(" ")[0];
  try {
    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi ${firstName}, ${itemName} is now back in stock. Go to grocernest.com now!`,
      },
    });
    console.log("Success Response", messageResponseFromGupshup);
  } catch (error) {
    console.error("Error Response", error);
  }
};

const sendDeliveryPinToUser = async (custName, pin, orderId, phoneNumber) => {
  const firstName = custName.split(" ")[0];

  console.log(firstName, pin, orderId, phoneNumber);
  try {
    const messageResponseFromGupshup = await client.message.send({
      channel: "whatsapp",
      source: "919433804769",
      destination: "91" + phoneNumber.toString(),
      "src.name": "grocernest",
      message: {
        isHSM: "true",
        type: "text",
        text: `Hi ${firstName}. Please share the pin ${pin} at the time of your delivery for order ${orderId}.`,
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
  sendNotificationsToUser,
  sendDeliveryPinToUser,
};
