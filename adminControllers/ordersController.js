const { sequelize } = require("../models");
const db = require("../models");
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;

const getAllPendingOrders = async (req, res, next) => {
    console.log("coming");

    Order.findAll({
        where: {
            status: "Placed",
        }
    }).then((resData) => {
        return res.status(201).json({
            success: true,
            data: resData,
            message: "Successfully fetched Pending orders data",
        });
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching Pending orders data from database",
        });
    })
}

module.exports = {
    getAllPendingOrders
}