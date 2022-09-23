const db = require("../../models");

const Leave = db.LeaveModel;
const User = db.UserModel;

const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.findAll({});

    if (leaves.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no leaves for current user",
      });
    }

    const promises = leaves.map(async (currentLeave) => {
      const currentUser = await User.findOne({
        where: { id: currentLeave.user_id },
      });

      return {
        currentLeave,
        currentUser,
      };
    });

    const resolvedArray = await Promise.all(promises);

    console.log(resolvedArray);

    return res.status(200).send({
      success: true,
      data: resolvedArray,
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

  try {
    const leave = await Leave.findOne({
      where: { id },
    });

    if (!leave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Could not fetch requested leave",
      });
    }

    const currentUser = await User.findOne({
      where: { id: leave.user_id },
    });

    return res.status(200).send({
      success: true,
      data: {
        leave,
        currentUser,
      },
      message: "Found requested leave",
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
  const { status } = req.params;

  try {
    const leaves = await Leave.findAll({
      where: { status },
    });

    if (leaves.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: `There are no ${status} leaves`,
      });
    }

    const promises = leaves.map(async (currentLeave) => {
      const currentUser = await User.findOne({
        where: { id: currentLeave.user_id },
      });

      return {
        currentLeave,
        currentUser,
      };
    });

    const resolvedArray = await Promise.all(promises);

    console.log(resolvedArray);

    return res.status(200).send({
      success: true,
      data: resolvedArray,
      message: `Found all ${status} leaves`,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getLeaveByUserId = async (req, res, next) => {
  const user_id = req.params.userId;
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

    const currentUser = await User.findOne({
      where: { id: user_id },
    });

    return res.status(200).send({
      success: true,
      data: {
        leaves,
        currentUser,
      },
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

const approveLeave = async (req, res, next) => {
  const id = parseInt(req.params.id);
  //const { bypass } = req.body;
  try {
    const currentLeave = await Leave.findOne({
      where: { id },
    });

    if (!currentLeave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested leave does not exist",
      });
    }

    const approve = await Leave.update(
      {
        status: "Approved",
        reject_reason: null,
      },
      {
        where: { id },
      }
    );

    const approvedLeave = await Leave.findOne({ where: { id } });

    return res.status(200).send({
      success: true,
      data: {
        oldLeaveStatus: currentLeave,
        noOfRowsUpdated: approve,
        updatedLeave: approvedLeave,
      },
      message: "Leave approved successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const rejectLeave = async (req, res, next) => {
  const { reject_reason } = req.body;
  const id = parseInt(req.params.id);
  try {
    const currentLeave = await Leave.findOne({
      where: { id },
    });

    if (!currentLeave) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested leave does not exist",
      });
    }

    const reject = await Leave.update(
      {
        status: "Rejected",
        reject_reason,
      },
      {
        where: { id },
      }
    );

    const rejectedLeave = await Leave.findOne({ where: { id } });

    return res.status(200).send({
      success: true,
      data: {
        oldLeaveStatus: currentLeave,
        noOfRowsUpdated: reject,
        updatedLeave: rejectedLeave,
      },
      message: "Leave rejected successfully",
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
  const {
    user_id,
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
      leave_type,
      half_day: half_day == true ? 1 : null,
      leave_reason,
      status: "Pending",
      created_by: 1,
      updated_by: 1,
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
  const {
    user_id,
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
        leave_type,
        half_day: half_day == true ? 1 : null,
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
  const { user_id } = req.body;
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
  getLeaveByUserId,
  approveLeave,
  rejectLeave,
  createLeave,
  editLeave,
  deleteLeave,
};
