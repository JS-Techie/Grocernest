const { sequelize } = require("../../models");
const db = require("../../models");
const MilkItems = db.MilkItemsModel;
const Subscription = db.SubscriptionsModel;
const SubscriptionItems = db.SubscriptionItemsModel;
const concatAddress = require("../../utils/concatAddress");



const getAllSubscriptionsWithFilter = async (req, res, next) => {
    try {

        const phno = req.body.phno;
        const orderType = req.body.orderType;
        const subscriptionId = req.body.subscriptionId;

        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        const phoneNoQuery =
            phno == undefined || phno == ""
                ? ""
                : " AND tc.contact_no LIKE '%" + phno + "%'";


        const subscriptionIdQuery =
            subscriptionId == undefined || subscriptionId == ""
                ? ""
                : " AND ts.id LIKE '%" + subscriptionId + "%'";


        const dateQuery = orderType == "Pending" ?

            startDate == undefined ||
                startDate == "" ||
                endDate == undefined ||
                endDate == ""
                ? ""
                : " AND ts.created_at BETWEEN '" +
                startDate +
                "' AND (SELECT DATE_ADD('" +
                endDate +
                "', INTERVAL 1 DAY))"
            :
            startDate == undefined ||
                startDate == "" ||
                endDate == undefined ||
                endDate == ""
                ? ""
                : " AND ts.start_date BETWEEN '" +
                startDate +
                "' AND (SELECT DATE_ADD('" +
                endDate +
                "', INTERVAL 1 DAY))"
            ;

        const [results, metadata] = await sequelize.query(`
        select
        tc.cust_no ,
        tc.cust_name ,
        tc.contact_no ,
        ts.id ,
        ts.admin_status ,
        ts.cancellation_reason,
        ts.start_date ,
        ts.end_date ,
        ts.created_at,
        ts.created_by
        from t_subscription ts 
        inner join t_customer tc
        where
        ts.cust_no = tc.cust_no and
        ts.admin_status = "${orderType}"
        ${phoneNoQuery}
        ${subscriptionIdQuery}
        ${dateQuery}
      `);

        if (results.length === 0) {
            return res.status(200).send({
                success: true,
                data: [],
                message: "No subscriptions found",
            });
        }

        const promises = results.map(async (current) => {
            console.log(current);
            return {
                cust_name: current.cust_name,
                contact_no: current.contact_no,
                cust_no: current.cust_no,
                subscription_id: current.id,
                status: current.admin_status,
                created_at: current.created_at,
                created_by: current.created_by,
                start_date: current.start_date,
                end_date: current.end_date,
                cancellation_reason: current.cancellation_reason,
            };
        });
        const responseArray = await Promise.all(promises);

        return res.status(200).send({
            success: true,
            data: responseArray,
            message: "Fetched all subscriptions for the user",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Something went wrong while fetching subscriptions, please check data field for more details",
        });
    }
};

const getSubscriptionDetailsById = async (req, res, next) => {

    try {
        const subscriptionId = req.params.subscriptionID;

        const [cust_result, metadata] = await sequelize.query(
            `
                  select 
                  tc.cust_no ,
                  tc.cust_name ,
                  tc.email ,
                  tc.contact_no ,
                  tc.comments,
                  ts.address_id
                  from t_customer tc inner join t_subscription ts 
                  where
                  tc.cust_no = ts.cust_no and
                  ts.id = "${subscriptionId}"
                  `
        );

        const address_id = cust_result[0].address_id;

        const address = await Promise.resolve(concatAddress(address_id));

        const [subs_result, metadata3] = await sequelize.query(
            `
                  select 
                  ts.id ,
                  ts.status ,
                  ts.admin_status ,
                  ts.start_date,
                  ts.end_date ,
                  ts.type,
                  ts.name,
                  ts.address_id,
                  ts.cancellation_reason 
                  from t_subscription ts
                  where
                  ts.id = "${subscriptionId}"
                  `
        );

        const [item_result, metadata2] = await sequelize.query(`
            SELECT ts.id,
            tsi.item_id ,
            tmi.brand ,
            tmi.type ,
            tmi.weight ,
            tmi.cost_price ,
            tmi.selling_price ,
            tmi.MRP ,
            tmi.CGST ,
            tmi.SGST ,
            tmi.IGST ,
            tmi.other_tax ,
            tmi.discount ,
            tmi.UOM ,
            tmi.image ,
            tmi.is_percentage ,
            tmi.category ,
            tmi.item_code ,
            tsi.quantity
            from t_subscription ts 
            inner join t_subscription_items tsi 
            inner join t_milk_items tmi 
            where 
            ts.id = tsi.subscription_id 
            AND 
            tsi.item_id  = tmi.item_id 
            AND 
            ts.id ="${subscriptionId}"
`);

        if (item_result.length == 0) {
            return res.status(404).send({
                success: false,
                data: null,
                message: "Could not fetch requested subscription for the current id",
            });
        }

        cust_result[0].address = address
        return res.status(200).send({
            success: true,
            data: {
                customer_details: cust_result[0],
                subscription_details: subs_result,
                itemDetails: item_result
            },
            message: "Successfully fetched requested subscription",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message:
                "Something went wrong while subscription details, please check data field for more details",
        });
    }
};

const editSubscription = async (req, res, next) => {

    const subscription_id = req.params.subscriptionID;
    const order_type = req.body.orderType;
    const cancellation_reason = req.body.cancellationReason;



    try {
        const existingSub = await Subscription.findOne({
            where: {
                id: subscription_id
            }
        })
        if (existingSub.length == 0) {
            return res.status(404).send({
                success: false,
                data: "",
                message: "No subscriptions found",
            });
        }

        const subscription = await Subscription.update(
            {
                admin_status: order_type,
                cancellation_reason: order_type == "Cancelled" ? cancellation_reason : existingSub.cancellation_reason,
                start_date: order_type == "Accepted" ? new Date(new Date().getTime() + 24 * 60 * 60 * 1000) : existingSub.start_date,
                end_date: order_type == "Cancelled" ? new Date(new Date().getTime()) : existingSub.end_date
            },
            {
                where: { id: subscription_id }
            }
        );

        return res.status(200).send({
            success: true,
            data: "",
            message: "Subscription updated successfully",
        });
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Error occurred while updating subscription details",
        });
    }
};

const editQuantity = async (req, res, next) => {

    const subs_id = req.params.subscriptionID;
    const items = req.body.items;

    try {
        items.map(async (current) => {
            await SubscriptionItems.update({
                quantity: current.quantity
            },
                {
                    where: {
                        item_id: current.itemid,
                        subscription_id: subs_id
                    }
                })
        })
        return res.status(200).send({
            success: true,
            data: "",
            message: "Item quantity updated successfully",
        });
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            data: error.data,
            message: "error occurred while updating quantity",
        });
    }
}

const generateInvoice = async (req, res, next) => { };


module.exports = {
    getAllSubscriptionsWithFilter,
    getSubscriptionDetailsById,
    editSubscription,
    generateInvoice,
    editQuantity
};
