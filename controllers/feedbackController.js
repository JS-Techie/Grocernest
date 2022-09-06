const db = require("../models");

const Feedback = db.FeedbackModel;
const Customer = db.CustomerModel;

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

      return {
        current,
        currentUser,
      };
    });

    const resolved = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: resolved,
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
  const { stars, description } = req.body;

  try {
    const newFeedback = await Feedback.create({
      cust_no,
      item_id,
      stars,
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
  const { stars, description } = req.body;
  const { cust_no } = req;

  try {
    const currentFeedback = await Feedback.findOne({
      where: { id },
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
      },
      {
        where: { id },
      }
    );

    const updatedFeedback = await Feedback.findOne({
      where: { id },
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

  try {
    const currentFeedback = await Feedback.findOne({
      where: { id },
    });

    if (!currentFeedback) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested feedback not found",
      });
    }

    const deletedFeedback = await Feedback.destroy({
      where: { id },
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
