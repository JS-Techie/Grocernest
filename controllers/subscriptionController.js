const uniqid = require("uniqid");

const db = require("../models");
const Subscriptions = db.SubscriptionsModel;
const SubscriptionItems = db.SubscriptionItemsModel;

const getAllSubscriptions = async (req, res, next) => {};
const getSubscriptionById = async (req, res, next) => {};
const createSubscription = async (req, res, next) => {};
const editSubscriptionDetails = async (req, res, next) => {};
const modifySubscriptionStatus = async (req, res, next) => {};
const deleteSubscription = async (req, res, next) => {};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  editSubscriptionDetails,
  modifySubscriptionStatus,
  deleteSubscription,
};
