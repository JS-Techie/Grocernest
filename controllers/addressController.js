const { sequelize, Sequelize } = require("../services/dbSetupService");
const db = require('../models');
var uniqid = require('uniqid');
const Address = db.AddressModel
const Customer = db.CustomerModel;



const getAllAddresses = async (req, res, next) => {

    let customer_no = req.query.cust_no;
    console.log("==>> Get all the Address of", customer_no);

    // Query
    Customer.findAll({
        include: [{
            model: Address,
            where: {
                cust_no: customer_no,
            }
        }],
    }).then((resData) => {
        return res.status(200).send({
            success: true,
            data: resData,
            message: "Found all addresses",
        });
    }).catch((error) => {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Error occurred while fetching addresses",
        });
    })
}

const createAddress = async (req, res, next) => {
    console.log("Add new address");
    console.log(req.body);

    let new_address = {
        cust_no: req.body.cust_no,
        address_id: uniqid(),
        address_title: req.body.address_title,
        address_line_1: req.body.address_line_1,
        address_line_2: req.body.address_line_2,
        state: req.body.state,
        city: req.body.city,
        PIN_code: req.body.PIN_code,
        landmark: req.body.landmark,
        created_by: '2'
    }

    // add
    try {
        //Add new customer to database
        const result = await Address.create(new_address);
        // console.log(result);
        return res.status(201).json({
            success: true,
            data: new_address,
            message: "Successfully added new address to database",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while adding new address to database",
        });
    }

}
const updateAddress = async (req, res, next) => {

    let address_id = req.body.address_id;
    let address_title = req.body.address_title;
    let address_line_1 = req.body.address_line_1;
    let address_line_2 = req.body.address_line_2;
    let state = req.body.state;
    let city = req.body.city;
    let PIN_code = req.body.PIN_code;
    let landmark = req.body.landmark;

    console.log("Update Address");

    Address.update(
        {
            address_title: address_title,
            address_line_1: address_line_1,
            address_line_2: address_line_2,
            state: state,
            city: city,
            PIN_code: PIN_code,
            landmark: landmark
        },
        { where: { address_id: address_id } }
    )
        .then((result) => {
            return res.status(201).json({
                success: true,
                data: {
                    address_id: address_id
                },
                message: "Successfully Updated address to database",
            });
        })
        .catch((error) => {
            return res.status(400).json({
                success: false,
                data: error.message,
                message: "Error while updating address to database",
            });
        })
}
const deleteAddress = async (req, res, next) => {

    let address_id = req.body.address_id;

    Address.destroy({
        where: {
            "address_id": address_id
        }
    }).then(() => {
        return res.status(201).json({
            success: true,
            message: "Address deleted successfully",
        });
    }).catch((error) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while deleting address from database",
        });
    })
}

module.exports = {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress
}