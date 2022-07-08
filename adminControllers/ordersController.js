const { sequelize } = require("../models");
const db = require("../models");
const Order = db.OrderModel;
const Customer = db.CustomerModel;

const OrderItems = db.OrderItemsModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;

const getAllPendingOrders = async (req, res, next) => {

    try {
        const [results, metadata] =
            await sequelize.query(`
            select tc.cust_name, tlo.cust_no ,tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Placed"
          `);

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No items found based on search term",
            });
        }

        const promises = results.map(async (current) => {
            return {
                cust_name: current.cust_name,
                cust_no: current.cust_no,
                order_id: current.order_id,
                status: current.status,
                created_at: current.created_at,
                created_by: current.created_by,
                total: current.total
            };
        });

        const responseArray = await Promise.all(promises);

        return res.status(200).send({
            success: true,
            data: responseArray,
            message: "Successfully fetched all pending orders",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching all pending orders",
        });
    }
}

module.exports = {
    getAllPendingOrders
}