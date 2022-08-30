const uniqid = require("uniqid");

const concatAddress = require("../utils/concatAddress");

const db = require("../models");
const Subscriptions = db.SubscriptionsModel;
const SubscriptionItems = db.SubscriptionItemsModel;
const MilkItems = db.MilkItemsModel;

const createSubscription = async (req, res, next) => {
  const currentUser = req.cust_no;
  const { items, type, name, address_id } = req.body;

  try {
    const newSubscription = await Subscriptions.create({
      id: uniqid(),
      type,
      name,
      created_by: 1,
      updated_by: 1,
      cust_no: currentUser,
      admin_status: "Pending",
      status: "Pending",
      address_id,
    });

    const promises = items.map(async (current) => {
      return {
        item_id: current.item_id,
        quantity: current.quantity,
        subscription_id: newSubscription.id,
        created_by: 1,
        updated_by: 1,
      };
    });

    const resolved = await Promise.all(promises);

    const itemsInSubscription = await SubscriptionItems.bulkCreate(resolved);

    return res.status(201).send({
      success: true,
      data: {
        newSubscription,
        itemsInSubscription,
      },
      message: "New subscription created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while creating subscription, please check data field for more details",
    });
  }
};

const editSubscriptionDetails = async (req, res, next) => {
  //get current user from JWT
  const currentUser = req.cust_no;
  const subscription_id = req.params.id;
  const { items, name, type } = req.body;
  try {
    const existingSub = await Subscriptions.findOne({
      where: { id: subscription_id, cust_no: currentUser },
    });

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested subscription does not exist for current user",
      });
    }

    const updateName = await existingSub.update(
      {
        name: name ? name : existingSub.name,
        type: type ? type : existingSub.type,
      },
      {
        where: { subscription_id, item_id },
      }
    );

    if (items.length === 0) {
      items.map(async (current) => {
        await SubscriptionItems.update(
          {
            quantity: current.quantity,
          },
          {
            where: { subscription_id, item_id: current.item_id },
          }
        );
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        oldItem: existingItemInSub,
        subscriptionDetailsUpdated: updateName,
      },
      message: "Updated quantity of item/type and name in subscription",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while editing subscription details, please check data field for more details",
    });
  }
};

const modifySubscriptionStatus = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;
  const { id } = req.params;
  const { status } = req.body;

  try {
    const existingSub = await Subscriptions.findOne({
      where: { cust_no: currentUser, id },
    });

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested Subscription not found",
      });
    }

    const updatedRows = await Subscriptions.update(
      {
        status,
      },
      {
        where: { cust_no: currentUser, id },
      }
    );

    const updatedSub = await Subscriptions.findOne({
      where: { cust_no: currentUser, id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldSubscription: existingSub,
        numberOfSubscriptionsUpdated: updatedRows,
        updatedSubscription: updatedSub,
      },
      message: "Modified status of subscription successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while modifying subscription status, please check data field for more details",
    });
  }
};

const deleteSubscription = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;
  const { id } = req.params;

  try {
    const existingSub = await Subscriptions.findOne({
      where: { id, cust_no: currentUser },
    });

    if (!existingSub) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested subscription does not exist",
      });
    }

    const itemsInSubscription = await SubscriptionItems.findAll({
      where: { subscription_id: id },
    });

    const deletedSubscriptions = await Subscriptions.destroy({
      where: { id, cust_no: currentUser },
    });

    if (itemsInSubscription.length > 0) {
      itemsInSubscription.map(async (current) => {
        await SubscriptionItems.destroy({
          where: { item_id: current.item_id },
        });
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        deletedSubscription: existingSub,
        numberOfSubscriptionsDeleted: deletedSubscriptions,
      },
      message: "Requested subscription deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while deleting subscription, check data field for more details",
    });
  }
};

const getAllSubscriptions = async (req, res, next) => {
  const cust_no = req.cust_no;
  try {
    const subscriptions = await Subscriptions.findAll({
      include: { model: SubscriptionItems },
      where: {
        cust_no: cust_no,
      },
    });

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
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching subscription",
    });
  }
};

const getSubscriptionById = async (req, res, next) => {
  const cust_no = req.cust_no;
  const subs_id = req.params.id;
  try {
    const subscriptions = await Subscriptions.findOne({
      include: { model: SubscriptionItems },
      where: {
        cust_no: cust_no,
        id: subs_id,
      },
    });

    // if no subs available
    if (!subscriptions) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No subscription found",
      });
    }

    const address = await Promise.resolve(
      concatAddress(subscriptions.address_id)
    );
    subscriptions.address = address;

    // if subs available
    return res.status(200).send({
      success: true,
      data: subscriptions,
      message: "subscription fetched successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching subscription",
    });
  }
};

const getAllItems = async (req, res, next) => {
  try {
    const items = await MilkItems.findAll();
    if (items.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no items to show right now",
      });
    }
    return res.status(200).send({
      success: true,
      data: items,
      message: "Fetched all items successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching items, please check data field for more details",
    });
  }
};
module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  editSubscriptionDetails,
  modifySubscriptionStatus,
  deleteSubscription,
  getAllItems,
};
