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
    }).then((res1) => {
        res.send(res1);
    }).catch((err) => {
        console.log(err);
    })
}

const createAddress = async (req, res, next) => {
    console.log("Add new address");
    console.log(req.body);

    let new_address = {
        cust_no: req.body.cust_no,
        address_id: uniqid(),
        address_title: req.body.address_title,
        address_desc: req.body.address_desc,
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
        return res.status(500).json({
            success: false,
            data: error,
            message: "Error while adding new address to database",
        });
    }

}
const updateAddress = async (req, res, next) => {

    let address_id = req.body.address_id;
    let address_title = req.body.address_title;
    let address_desc = req.body.address_desc;

    console.log("Update Address");

    Address.update(
        {
            address_title: address_title,
            address_desc: address_desc
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
        .catch((err) =>
            console.log(err)
        )
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
    }).catch((err) => {
        console.log(error);
    })
}

module.exports = {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress
}