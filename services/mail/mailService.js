const ejs = require('ejs');
const transporter = require('./transporter');

const sendRegistrationEmail = async (mailid) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Registration',
        html: await ejs.renderFile('./templates/registration.ejs')
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
        html: await ejs.renderFile('./templates/orderstatus.ejs', {
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
        html: await ejs.renderFile('./templates/orderstatus.ejs', {
            text: msg,
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

// order placed mail with invoice attached
const sendOrderPlacedEmail = async (mailid, orderId) => {
    var mailOptions = {
        from: 'grocernest@gmail.com',
        to: mailid,
        subject: 'Grocernest Order Status',
        html: await ejs.renderFile('./templates/orderstatus.ejs', {
            text: msg,
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


module.exports = {
    sendRegistrationEmail,
    sendOrderStatusEmail,
    sendCancelledStatusEmail,
    sendOrderPlacedEmail
}
// sendRegistrationEmail('chandratanmoy5@gmail.com');
// sendOrderStatusEmail('chandratanmoy5@gmail.com', 'd154232g6532fgk5k', 'Your order is successfully placed');