const Gupshup = require('gupshup-whatsapp-api')

let client = new Gupshup({
    apiKey: 'hm7797tb46hrtrgcsqksvxs69yj9zza4'
});

const sendMsgToWhatsapp = (phno) => {
    console.log("Sending sms to whatsapp..");
    client.message.send({
        channel: "whatsapp",
        source: "917834811114",
        destination: phno.toString(),
        'src.name': "Grocernest",
        message: {
            type: "file",
            url: "http://www.africau.edu/images/default/sample.pdf",
            filename: "Invoice",
            text: "hi there"
        }
    }).then((response) => {
        console.log("Document message sent", response)
    }).catch(err => {
        console.log("Document message err:", err)
    })

}

const sendInvoiceToWhatsapp = (phno, link) => {
    console.log("Sending Invoice to whatsapp..");

    client.message.send({
        channel: "whatsapp",
        source: "917834811114",
        destination: "918910443583",
        'src.name': "Grocernest",
        message: {
            isHSM: "false",
            type: "text",
            text: "hi there"
        }
    }).then((response) => {
        console.log("Text message sent", response)
    }).catch(err => {
        console.log("Text message err:", err)
    })
}

module.exports = {
    sendMsgToWhatsapp,
    sendInvoiceToWhatsapp
};