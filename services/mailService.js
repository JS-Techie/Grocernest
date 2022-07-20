var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ctanmoy345@gmail.com',
        pass: 'sbirfydifvyckvin'
    }
});
const sendEmail = (mailId, text) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailId,
        subject: 'Grocernest ',
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// sendEmail("chandratanmoy5@gmail.com", "abcd");

module.exports = {
    sendEmail
};