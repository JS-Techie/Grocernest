const db = require("../models");
const Subscription = db.SubscriptionModel;
const SubscriptionItems = db.SubscriptionItemsModel;

const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: {
        model: SubscriptionItems,
      },
    });

    if (subscriptions.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No subscriptions found",
      });
    }

    return res.status(200).send({
      success: true,
      data: subscriptions,
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
const getSubscriptionById = async (req, res, next) => {
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
const editSubscription = async (req, res, next) => {};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  editSubscription,
};
