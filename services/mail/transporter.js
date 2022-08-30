var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.grocernest@gmail.com',
        pass: 'vllxmhzfhxlqhgxn'
    }
});

module.exports = transporter
