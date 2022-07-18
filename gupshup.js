const Gupshup = require('gupshup-whatsapp-api')

let client = new Gupshup({
    apiKey: 'hm7797tb46hrtrgcsqksvxs69yj9zza4'
});

console.log("GUPSHUP whatsapp");


// client.message.send({
//     channel: "whatsapp",
//     source: "917834811114",
//     destination: "918910443583",
//     'src.name': "Grocernest",
//     message: {
//         isHSM: "false",
//         type: "text",
//         text: "hi there"
//     }
// }).then((response) => {
//     console.log("Text message sent", response)
// }).catch(err => {
//     console.log("Text message err:", err)
// })


client.message.send({
    channel: "whatsapp",
    source: "917834811114",
    destination: "918910443583",
    'src.name': "Grocernest",
    message: {
        type: "file",
        url: "sample_pdf.pdf",
        filename: "Sample file"
    }
}).then((response) => {
    console.log("Document message sent", response)
}).catch(err => {
    console.log("Document message err:", err)
})