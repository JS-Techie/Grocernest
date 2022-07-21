var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ctanmoy345@gmail.com',
        pass: 'sbirfydifvyckvin'
    }
});

module.exports = transporter