// const uniqid = require("uniqid");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");
const db = require("../../models");
const MilkItems = db.MilkItemsModel;
const Subscription = db.SubscriptionsModel;
const SubscriptionItems = db.SubscriptionItemsModel;



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


        const dateQuery =
            startDate == undefined ||
                startDate == "" ||
                endDate == undefined ||
                endDate == ""
                ? ""
                : " AND ts.start_date BETWEEN '" +
                startDate +
                "' AND (SELECT DATE_ADD('" +
                endDate +
                "', INTERVAL 1 DAY))";

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
    const id = req.params.subscriptionID;
    try {
        const subscription = await Subscription.findOne({
            include: { model: SubscriptionItems },
            where: { id },
        });
        if (!subscription) {
            return res.status(404).send({
                success: false,
                data: [],
                message: "Requested subscription not found",
            });
        }

        return res.status(200).send({
            success: true,
            data: subscription,
            message: "Successfully fetched requested subscription",
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



const editSubscription = async (req, res, next) => {

};

const generateInvoice = async (req, res, next) => { };


module.exports = {
    getAllSubscriptionsWithFilter,
    getSubscriptionDetailsById,
    editSubscription,
    generateInvoice
};
