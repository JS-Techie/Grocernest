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
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
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
                contact_no: current.contact_no,
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

getOrderDetails = async (req, res, next) => {
    const orderId = req.body.orderId;
    // console.log("get order details", orderId);

    try {
        const [results, metadata] =
            await sequelize.query(`
            select 
            toi.item_id,ti.name,toi.quantity,ti.item_cd,ti.units,ti.UOM,
            tlc.group_name as category,
            tlsc.sub_cat_name as subcategory,
            ti.brand_id ,ti.div_id, ti.department_id ,ti.size_id,ti.description 
            from t_order_items toi
            inner join t_item ti 
            inner join t_lkp_category tlc 
            inner join t_lkp_sub_category tlsc 
            WHERE toi.order_id = "${orderId}" 
            AND ti.id = toi.item_id 
            and tlc.id = ti.category_id 
            and tlsc.id = ti.sub_category_id 
          `);

        const [cust_result, metadata2] = await sequelize.query(
            `
            select 
            tc.id ,
            tc.cust_no ,
            tc.cust_name ,
            tlo.address ,
            tc.email ,
            tc.contact_no ,
            tc.comments 
            from t_customer tc inner join t_lkp_order tlo 
            where
            tc.id = tlo.cust_no and
            tlo.order_id = "${orderId}"
            `
        )

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No items found based on search term",
            });
        }

        const responseArray = await Promise.all(results);

        return res.status(200).send({
            success: true,
            data: {
                "customer_details": cust_result[0],
                "order_item_details": responseArray
            },
            message: "Successfully fetched all items of this order",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching items for this order",
        });
    }
}


module.exports = {
    getAllPendingOrders,
    getOrderDetails
}