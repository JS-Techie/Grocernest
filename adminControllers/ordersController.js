const { sequelize } = require("../models");
const db = require("../models");
const Order = db.OrderModel;
// const Customer = db.CustomerModel;
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

const getAllOrderByPhoneNumber = async (req, res, next) => {

    const phno = req.body.phno;
    const orderType = req.body.orderType;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const orderid = req.body.orderId;

    const phoneNoQuery = (phno == undefined || phno == "" ? "" : " AND tc.contact_no LIKE '%" + phno + "%'");
    const dateQuery = (startDate == undefined || startDate == "" || endDate == undefined || endDate == "" ? "" : " AND tlo.created_at BETWEEN '" + startDate + "' AND '" + endDate + "'");
    const orderId = (orderid == undefined || orderid == "" ? "" : " AND tlo.order_id LIKE '%" + orderid + "%'");

    // console.log(phno, orderType);

    try {
        const [results, metadata] =
            await sequelize.query(`
            select tc.cust_name, 
            tlo.cust_no , 
            tc.contact_no, 
            tlo.order_id,
            tlo.status,
            tlo.created_at,
            tlo.created_by,
            tlo.total,
            tlo.transporter_name,
            tlo.cancellation_reason,
            tlo.applied_discount,
            tlo.wallet_balance_used,
            tlo.final_payable_amount
            from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="${orderType}"
            ${phoneNoQuery}
            ${dateQuery}
            ${orderId}
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
                transporter_name: current.transporter_name,
                cancellation_reason: current.cancellation_reason,
                total: current.total,
                applied_discount: current.applied_discount,
                wallet_balance_used: current.wallet_balance_used,
                final_payable_amount: current.final_payable_amount
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
const getOrderDetails = async (req, res, next) => {
    const orderId = req.body.orderId;
    // console.log("get order details", orderId);

    try {
        const [results, metadata] =
            await sequelize.query(`
            select 
            toi.item_id,ti.name,toi.quantity,ti.item_cd,ti.units,ti.UOM,ti.is_gift,
            tlc.group_name as category,
            tlsc.sub_cat_name as subcategory,
            ti.brand_id ,ti.div_id, ti.department_id ,ti.size_id,ti.description,
            null as type, null as amount_of_discount, null as is_percentage, 
            null as offer_item_id, 
            null as item_id_1,
            null as item_id_2,
            null as item_1_quantity,
            null as item_2_quantity
            from t_order_items toi
            inner join t_item ti 
            inner join t_lkp_category tlc 
            inner join t_lkp_sub_category tlsc 
            inner join t_offers to2 
            WHERE toi.order_id = "${orderId}" 
            AND ti.id = toi.item_id 
            and tlc.id = ti.category_id 
            and tlsc.id = ti.sub_category_id 

            union
            
            select 
            toi.item_id,ti.name,toi.quantity,ti.item_cd,ti.units,ti.UOM,ti.is_gift,
            tlc.group_name as category,
            tlsc.sub_cat_name as subcategory,
            ti.brand_id ,ti.div_id, ti.department_id ,ti.size_id,ti.description,
            to2.type,to2.amount_of_discount, to2.is_percentage, 
            to2.item_id as offer_item_id, to2.item_id_1 ,to2.item_id_2 ,to2.item_1_quantity ,to2.item_2_quantity 
            from t_order_items toi
            inner join t_item ti 
            inner join t_lkp_category tlc 
            inner join t_lkp_sub_category tlsc 
            inner join t_offers to2 
            WHERE toi.order_id = "${orderId}" 
            AND ti.id = toi.item_id 
            and tlc.id = ti.category_id 
            and tlsc.id = ti.sub_category_id 
            and (to2.item_id = toi.item_id
            or to2.item_id_1  = toi.item_id
            )
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
            tc.cust_no = tlo.cust_no and
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

        const promises = results.map(async (current) => {

            const batches = await Batch.findAll({
                where: { item_id: current.item_id }
            })

            const oldestBatch = batches[0];

            return ({
                item_id: current.item_id,
                name: current.name,
                quantity: current.quantity,
                item_cd: current.item_cd,
                units: current.units,
                UOM: current.UOM,
                category: current.category,
                subcategory: current.subcategory,
                brand_id: current.brand_id,
                div_id: current.div_id,
                department_id: current.department_id,
                size_id: current.size_id,
                description: current.description,
                cost_price: oldestBatch.cost_price,
                sale_price: oldestBatch.sale_price,
                MRP: oldestBatch.MRP,
                discount: oldestBatch.discount,
                is_free: oldestBatch.sale_price === 0 ? true : false,

                type: current.type,
                amount_of_discount: current.amount_of_discount,
                is_percentage: current.amount_of_discount ? current.is_percentage === 1 ? true : false : null,
                offer_item_id: current.offer_item_id,
                item_id_1: current.item_id_1,
                item_id_2: current.item_id_2,
                item_1_quantity: current.item_1_quantity,
                item_2_quantity: current.item_2_quantity

            })
        })

        const resolvedArray = await Promise.all(promises);

        const responseArray = [
            ...new Map(resolvedArray.map((item) => [item["item_id"], item])).values(),
        ];

        console.log("resolvedArray", resolvedArray);
        console.log("responseArray", responseArray);

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

const changeOrderStatus = async (req, res, next) => {
    console.log("change order status");

    let cancellationReason = req.body.cancellationReason ? req.body.cancellationReason : ""
    console.log("cancellationReason", cancellationReason);
    Order.update(
        {
            status: req.body.status,
            cancellation_reason: cancellationReason,
            updated_at: new Date()
        },
        { where: { order_id: req.body.orderId } }
    )
        .then((result) => {
            return res.status(200).send({
                success: true,
                data: { "status": req.body.status },
                message: "Successfully changed order status",
            });
        })
        .catch((err) => {
            return res.status(400).send({
                success: false,
                data: err.message,
                message: "Error occurred while changing the order status",
            });
        })
}

const acceptedOrders = async (req, res, next) => {
    try {
        const [results, metadata] =
            await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Accepted"
          `);

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No orders found",
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
            message: "Successfully fetched all accepted orders",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching all accepted orders",
        });
    }
}

const assignTransporter = async (req, res, next) => {
    let orderId = req.body.orderId
    let transporterName = req.body.transporterName

    Order.update(
        {
            status: "Shipped",
            transporter_name: transporterName
        },
        { where: { order_id: orderId } }
    )
        .then((result) => {
            return res.status(200).send({
                success: true,
                data: { "status": "Shipped" },
                message: "Order successfully shipped",
            });
        })
        .catch((error) => {
            return res.status(400).send({
                success: false,
                data: error.message,
                message: "Error while assigning transporter name",
            });
        })

}
const getShippedOrders = async (req, res, next) => {
    try {
        const [results, metadata] =
            await sequelize.query(`
            select tlo.transporter_name, tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Shipped"
          `);

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No orders found",
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
                total: current.total,
                transporterName: current.transporter_name
            };
        });

        const responseArray = await Promise.all(promises);

        return res.status(200).send({
            success: true,
            data: responseArray,
            message: "Successfully fetched all shipped orders",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching all shipped orders",
        });
    }
}

const getDeliveredOrders = async (req, res, next) => {
    try {
        const [results, metadata] =
            await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total, tlo.transporter_name from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Delivered"
          `);

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No orders found",
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
                total: current.total,
                transporterName: current.transporter_name
            };
        });

        const responseArray = await Promise.all(promises);

        return res.status(200).send({
            success: true,
            data: responseArray,
            message: "Successfully fetched all delivered orders",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching all delivered orders",
        });
    }
}

const getCanceledorders = async (req, res, next) => {
    try {
        const [results, metadata] =
            await sequelize.query(`
            select tc.cust_name, tlo.cust_no , tc.contact_no, tlo.order_id ,tlo.status, tlo.created_at ,tlo.created_by ,tlo.total, tlo.transporter_name,tlo.cancellation_reason from t_lkp_order tlo inner join t_customer tc 
            where tc.cust_no = tlo.cust_no 
            AND tlo.status="Cancelled"
          `);

        if (results.length === 0) {
            return res.status(201).send({
                success: true,
                data: [],
                message: "No orders found",
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
                total: current.total,
                transporterName: current.transporter_name,
                cancellation_reason: current.cancellation_reason
            };
        });

        const responseArray = await Promise.all(promises);

        return res.status(200).send({
            success: true,
            data: responseArray,
            message: "Successfully fetched all canceled orders",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Error occurred while fetching all canceled orders",
        });
    }
}


module.exports = {
    getAllPendingOrders,
    getOrderDetails,
    changeOrderStatus,
    acceptedOrders,
    assignTransporter,
    getShippedOrders,
    getDeliveredOrders,
    getCanceledorders,
    getAllOrderByPhoneNumber
}