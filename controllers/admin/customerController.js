const { sequelize } = require("../../models");
const Sequelize = require('sequelize');
const db = require("../../models");
const Op = Sequelize.Op;
const Customer = db.CustomerModel


const getCustomerList = async (req, res, next) => {
    // console.log("getCustomerList");

    let search_term = req.params.phno ? req.params.phno : ""
    Customer.findAll({
        where: {
            active_ind: "Y",
            contact_no: {
                [Op.like]: "%" + search_term + "%"
            }
        },
        attributes: ["cust_no", "cust_name", "email", "contact_no"]
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData,
            message: "Successfully fetched all Customers",
        });
    }).catch((error) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching Customers",
        });
    })


}


module.exports = {
    getCustomerList
}