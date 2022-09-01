const Gupshup = require('gupshup-whatsapp-api')

let client = new Gupshup({
    apiKey: 'hm7797tb46hrtrgcsqksvxs69yj9zza4'
});

const sendOTPToWhatsapp = (phno, otp) => {
    console.log("Sending OTP to whatsapp... ", otp);

    client.message.send({
        channel: "whatsapp",
        source: "919433804769",
        destination: "91" + phno.toString(),
        'src.name': "grocernest",
        message: {
            isHSM: "true",
            type: "text",
            text: otp.toString() + " is your OTP (One Time Password) for logging into the Grocernest app. For Security Reasons don't share the OTP."
        }
    }).then((response) => {
        console.log("Template message sent", response);
    }).catch(err => {
        console.log("Template message err:", err);
    })
}

const sendInvoiceToWhatsapp = (phno, order_id, link) => {
    console.log("Sending sms to whatsapp..");
    client.message.send({
        channel: "whatsapp",
        source: "919433804769",
        destination: "91" + phno.toString(),
        'src.name': "grocernest",
        message: {
            isHSM: "true",
            type: "text",
            text: "Hi, Your order with order ID " + "*" + order_id + "*" + " is placed Successfully,  you can download your invoice by clicking this link " + link
        }
    }).then((response) => {
        console.log("Template message sent", response);
    }).catch(err => {
        console.log("Template message err:", err);
    })
}

const sendOrderStatusToWhatsapp = (phno, order_id, status) => {
    console.log("Sending sms to whatsapp..");
    client.message.send({
        channel: "whatsapp",
        source: "919433804769",
        destination: "91" + phno.toString(),
        'src.name': "grocernest",
        message: {
            isHSM: "true",
            type: "text",
            text: "Your order with order ID " + "*" + order_id + "*" + " has been " + "*" + status + "*" + "."
        }
    }).then((response) => {
        console.log("Template message sent", response);
    }).catch(err => {
        console.log("Template message err:", err);
    })
}

const sendOrderShippedToWhatsapp = (phno, order_id, delivery_boy) => {
    // Your order with order ID [123456] has been [Shipped]. Your order will be delivered by [Somename].

    client.message.send({
        channel: "whatsapp",
        source: "919433804769",
        destination: "91" + phno.toString(),
        'src.name': "grocernest",
        message: {
            isHSM: "true",
            type: "text",
            text: "Your order with order ID " + "*" + order_id + "*" + " has been " + "*" + "Shipped" + "*" + ". Your order will be delivered by " + "*" + delivery_boy + "*" + "."
        }
    }).then((response) => {
        console.log("Template message sent", response);
    }).catch(err => {
        console.log("Template message err:", err);
    })
}

const sendAdminCancelledOrderStatusToWhatsapp = (phno, order_id, cancellation_reason) => {
    // Your order with order ID [123456] has been canceled. Cancellation reason: [some issue]
    client.message.send({
        channel: "whatsapp",
        source: "919433804769",
        destination: "91" + phno.toString(),
        'src.name': "grocernest",
        message: {
            isHSM: "true",
            type: "text",
            text: "Your order with order ID " + "*" + order_id + "*" + " has been canceled. Cancellation reason: " + "*" + cancellation_reason + "*"
        }
    }).then((response) => {
        console.log("Template message sent", response);
    }).catch(err => {
        console.log("Template message err:", err);
    })
}



module.exports = {
    sendInvoiceToWhatsapp,
    sendOTPToWhatsapp,
    sendOrderStatusToWhatsapp,
    sendOrderShippedToWhatsapp,
    sendAdminCancelledOrderStatusToWhatsapp
};