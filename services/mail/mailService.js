const ejs = require('ejs');
const transporter = require('./transporter');
const fs = require('fs');

const sendRegistrationEmail = async (mailid) => {
    var mailOptions = {
        from: {
            name: 'GrocerNest',
            address: 'noreply.grocernest@gmail.com'
        },
        to: mailid,
        subject: 'Grocernest Registration',
        html: await ejs.renderFile('./services/mail/templates/registration.ejs')
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const sendOrderStatusEmail = async (mailid, orderId, msg) => {

    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Order Status',
        html: await ejs.renderFile('./services/mail/templates/orderstatus.ejs', {
            text: msg,
            orderId: orderId
        })
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const sendCancelledStatusEmail = async (mailid, orderId, cancellation_reason) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Order Status',
        html: await ejs.renderFile('./services/mail/templates/cancelledOrder.ejs', {
            orderId: orderId,
            cancellation_reason: cancellation_reason
        })
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// user cancel email

const sendCancelledByUserStatusEmail = async (mailid, orderId) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Order Status',
        html: await ejs.renderFile('./services/mail/templates/userCancelledOrders.ejs', {
            orderId: orderId
        })
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


// order placed mail with invoice attached
const sendOrderPlacedEmail = async (mailid, orderId) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Order Status',
        html: await ejs.renderFile('./services/mail/templates/orderPlaced.ejs', {
            orderId: orderId,
        }),
        attachments: [{
            filename: `invoice-${orderId}.pdf`,
            path: `./invoice-${orderId}.pdf`,
            contentType: 'application/pdf'
        }],
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // delete the invoice
            fs.unlinkSync(`invoice-${orderId}.pdf`);
        }
    });
}


module.exports = {
    sendRegistrationEmail,
    sendOrderStatusEmail,
    sendCancelledStatusEmail,
    sendOrderPlacedEmail,
    sendCancelledByUserStatusEmail
}
// sendRegistrationEmail('chandratanmoy5@gmail.com');
// sendOrderStatusEmail('chandratanmoy5@gmail.com', 'd154232g6532fgk5k', 'Your order status changed to this');
// sendOrderPlacedEmail('chandratanmoy5@gmail.com', '76846738')