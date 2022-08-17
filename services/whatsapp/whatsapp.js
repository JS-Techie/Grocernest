const Gupshup = require('gupshup-whatsapp-api')

let client = new Gupshup({
    apiKey: 'hm7797tb46hrtrgcsqksvxs69yj9zza4'
});

const sendInvoiceToWhatsapp = (phno, link, order_id) => {
    console.log("Sending sms to whatsapp..");
    client.message.send({
        channel: "whatsapp",
        source: "917834811114",
        destination: "91" + phno.toString(),
        'src.name': "Grocernest",
        message: {
            type: "file",
            url: "https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf",
            // url: "http://ecomm-dev.s3.ap-south-1.amazonaws.com/pdfs/invoices/invoice-7094387.pdf",
            filename: "Invoice-" + order_id,
            caption: "Hi, Your order(" + order_id + ") is placed successfully. Please find the attached Invoice. Thank you.."
        }
    }).then((response) => {
        console.log("Document message sent", response);
    }).catch(err => {
        console.log("Document message err:", err);
    })
}

const sendTextMsg = (phno, msg) => {
    console.log("Sending update to user using whatsapp..");

    client.message.send({
        channel: "whatsapp",
        source: "917834811114",
        destination: "91" + phno.toString(),
        'src.name': "Grocernest",
        message: {
            isHSM: "false",
            type: "text",
            text: msg
        }
    }).then((response) => {
        console.log("Text message sent", response)
    }).catch(err => {
        console.log("Text message err:", err)
    })
}

const sendOrderStatusWhatsapp = (phno, msg) => {
    sendTextMsg(phno, msg);
}
module.exports = {
    sendInvoiceToWhatsapp,
    // sendRegistrationWhatsapp,

    sendOrderStatusWhatsapp,
};