const uniqid = require("uniqid");

const db = require("../models");
const Subscriptions = db.SubscriptionsModel;
const SubscriptionItems = db.SubscriptionItemsModel;

const getAllSubscriptions = async (req, res, next) => {
  const cust_no = req.cust_no;
  try {
    const subscriptions = await Subscriptions.findAll({
      include: { model: SubscriptionItems },
      where: {
        cust_no: cust_no
      }
    })

    // if no subs available
    if (subscriptions.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No subscriptions found",
      });
    }

    // if subs available
    return res.status(200).send({
      success: true,
      data: subscriptions,
      message: "subscriptions fetched successfully",
    });
  }
  catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching subscription",
    });
  }
};
const getSubscriptionById = async (req, res, next) => {
  const cust_no = req.cust_no;
  const subs_id = req.params.id
  try {
    const subscriptions = await Subscriptions.findAll({
      include: { model: SubscriptionItems },
      where: {
        cust_no: cust_no,
        id: subs_id
      }
    })

    // if no subs available
    if (subscriptions.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No subscription found",
      });
    }

    // if subs available
    return res.status(200).send({
      success: true,
      data: subscriptions,
      message: "subscription fetched successfully",
    });
  }
  catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching subscription",
    });
  }
};
const createSubscription = async (req, res, next) => { };
const editSubscriptionDetails = async (req, res, next) => { };
const modifySubscriptionStatus = async (req, res, next) => { };
const deleteSubscription = async (req, res, next) => { };

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  editSubscriptionDetails,
  modifySubscriptionStatus,
  deleteSubscription,
};
