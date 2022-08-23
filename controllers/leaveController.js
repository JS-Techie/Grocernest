const db = require("../models");

const Leave = db.LeaveModel;

const getAllLeaves = async (req, res, next) => {
  const user_id = req.user_id;
  try {
    const leaves = await Leave.findAll({
      where: { user_id },
    });

    if (leaves.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no leaves for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: leaves,
      message: "Found all leaves for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getLeaveById = async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user_id;
  try {
    const leave = await Leave.findOne({
      where: { id, user_id },
    });

    if (!leave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Could not fetch requested leave for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: leave,
      message: "Found requested leave for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getLeaveByStatus = async (req, res, next) => {
  const status = req.params.status;
  const user_id = req.user_id;
  try {
    const leaves = await Leave.findAll({
      where: { status, user_id },
    });

    if (leaves.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: `There are no ${status} leaves for current user`,
      });
    }

    return res.status(200).send({
      success: true,
      data: leaves,
      message: `Found all ${status} leaves for current user`,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const createLeave = async (req, res, next) => {
  const user_id = req.user_id;
  const {
    start_date,
    end_date,
    no_of_days,
    leave_reason,
    leave_type,
    half_day,
  } = req.body;
  try {
    const newLeave = await Leave.create({
      user_id,
      start_date,
      end_date,
      no_of_days,
      leave_reason,
      status: "Pending",
      created_by: 1,
      updated_by: 1,
      half_day: half_day == true ? 1 : null,
      leave_type,
    });

    return res.status(201).send({
      success: true,
      data: newLeave,
      message: "New leave created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const editLeave = async (req, res, next) => {
  const user_id = req.user_id;
  const {
    start_date,
    end_date,
    no_of_days,
    leave_reason,
    leave_type,
    half_day,
  } = req.body;
  const id = req.params.id;
  try {
    const currentLeave = await Leave.findOne({
      where: { id, user_id },
    });

    if (!currentLeave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested leave not found for current user",
      });
    }

    const updateLeave = await Leave.update(
      {
        start_date,
        end_date,
        no_of_days,
        leave_reason,
        half_day: half_day == true ? 1 : null,
        leave_type,
      },
      {
        where: { id, user_id },
      }
    );

    const updatedLeave = await Leave.findOne({
      where: { id, user_id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldLeaveDetails: currentLeave,
        noOfRowsUpdated: updateLeave,
        updatedLeave,
      },
      message: "Successfully updated current leave details of current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const deleteLeave = async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user_id;
  try {
    const currentLeave = await Leave.findOne({
      where: { id, user_id },
    });
    if (!currentLeave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested leave not found for current user",
      });
    }
    const deletedLeave = await Leave.destroy({
      where: { user_id, id },
    });

    return res.status(200).send({
      success: true,
      data: {
        leaveDetails: currentLeave,
        noOfRowsUpdated: deletedLeave,
      },
      message: "Requested leave deleted successfully",
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
  getAllLeaves,
  getLeaveById,
  getLeaveByStatus,
  createLeave,
  editLeave,
  deleteLeave,
};
