const { optIn, optOut } = require('../services/whatsapp/optInOut');
const optInUser = async (req, res, next) => {

    try {
        let mobile_number = req.body.mobile_number;
        if (!mobile_number)
            return res.status(400).send({
                success: true,
                data: "",
                message: "mobile number not present",
            });

        let response = await Promise.resolve(optIn("91" + mobile_number));
        if (response == 202)
            return res.status(200).send({
                success: true,
                data: "",
                message: "whatsapp number opt in successfully",
            });

        return res.status(400).send({
            success: true,
            data: "",
            message: "error occured while opt in whatsapp number",
        });

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "error occured while opt in whatsapp number",
        });
    }
};

const optOutUser = async (req, res, next) => {
    try {
        let mobile_number = req.body.mobile_number;
        if (!mobile_number)
            return res.status(400).send({
                success: true,
                data: "",
                message: "mobile number not present",
            });

        let response = await Promise.resolve(optOut("91" + mobile_number));
        if (response == 202)
            return res.status(200).send({
                success: true,
                data: "",
                message: "whatsapp number opt out successfully",
            });

        return res.status(400).send({
            success: true,
            data: "",
            message: "error occured while opt out whatsapp number",
        });

    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "error occured while opt out whatsapp number",
        });
    }
};

module.exports = {
    optInUser,
    optOutUser
};
