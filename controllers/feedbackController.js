const db = require("../models");

const Feedback = db.FeedbackModel;
const Customer = db.CustomerModel;
const Order = db.OrderModel;
const OrderItems = db.OrderItemsModel;

const getAllFeedbacks = async (req, res, next) => {
  const { item_id } = req.params;
  try {
    const feedbacks = await Feedback.findAll({ where: { item_id } });

    if (feedbacks.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no feedbacks for this item",
      });
    }

    const promises = feedbacks.map(async (current) => {
      const currentUser = await Customer.findOne({
        where: { cust_no: current.cust_no },
      });

      let numberOfRatings;
      let numberOfReviews;
      let totalRating;
      let averageRating;

      feedbacks.map((current) => {
        if (current.stars) {
          numberOfRatings++;
          totalRating += current.stars;
        }
        if (current.description) {
          numberOfReviews++;
        }
      });

      averageRating = totalRating / numberOfRatings;

      return {
        current,
        currentUser,
      };
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: {
        feedbacks: resolved,
        numberOfRatings,
        numberOfReviews,
        averageRating,
      },
      message: "Found all feedbacks for this current item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getFeedbackById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const feedback = await Feedback.findOne({
      where: { id },
    });

    if (!feedback) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Requested feedback not found for current item",
      });
    }

    const currentUser = await User.findOne({
      where: { cust_no: feedback.cust_no },
    });

    return res.status(200).send({
      success: true,
      data: {
        feedback,
        currentUser,
      },
      message: "Found requested feedback for current item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const createFeedback = async (req, res, next) => {
  const { item_id } = req.params;
  const { cust_no } = req;
  const { stars, description, title } = req.body;

  try {
    const currentOrders = await Order.findAll({
      where: { cust_no },
    });

    console.log("Orders for this customer", currentOrders);

    if (currentOrders.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "You have not placed any orders, hence you cant review an item",
      });
    }

    // const promises = currentOrders.map(async (currentOrder) => {

    // });


    let userOrderedThisItem = false;
    console.log(userOrderedThisItem);

    if (!userOrderedThisItem) {
      console.log("In if");
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "You have not ordered this item, hence you cant place a review",
      });
    }

    const newFeedback = await Feedback.create({
      title,
      cust_no,
      item_id,
      stars: parseInt(stars),
      description,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newFeedback,
      message: "New Feedback for current item created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editFeedback = async (req, res, next) => {
  const { id, item_id } = req.params;
  const { stars, description, title } = req.body;
  const { cust_no } = req;

  try {
    const currentFeedback = await Feedback.findOne({
      where: { id, cust_no },
    });

    if (!currentFeedback) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested feedback not found",
      });
    }

    const updateFeedback = await Feedback.update(
      {
        stars,
        description,
        title,
      },
      {
        where: { id, cust_no },
      }
    );

    const updatedFeedback = await Feedback.findOne({
      where: { id, cust_no },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldFeedback: currentFeedback,
        numberOfRowsUpdated: updateFeedback,
        newFeedback: updatedFeedback,
      },
      message: "Requested feedback updated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const deleteFeedback = async (req, res, next) => {
  const { id } = req.params;
  const { cust_no } = req;

  try {
    const currentFeedback = await Feedback.findOne({
      where: { id, cust_no },
    });

    if (!currentFeedback) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested feedback not found",
      });
    }

    const deletedFeedback = await Feedback.destroy({
      where: { id, cust_no },
    });

    return res.status(200).send({
      success: true,
      data: {
        numberOfRowsUpdated: deletedFeedback,
        deletedFeedback: currentFeedback,
      },
      message: "Requested feedback deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  editFeedback,
  deleteFeedback,
};
