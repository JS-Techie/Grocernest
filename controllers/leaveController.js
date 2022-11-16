const { sequelize } = require("../models");
const db = require("../models");
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../config/s3Config");

const Leave = db.LeaveModel;

const s3 = new S3(s3Config);

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
    hours,
    base64,
    extension,
  } = req.body;

  if (leave_type === "Emergency" && !hours) {
    return res.status(400).send({
      success: false,
      data: [],
      message:
        "You have chosen to take emergency leave, please enter the number of hours you want to take leave for",
    });
  }

  if (leave_type === "Annual/Casual" && no_of_days > 2) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "You cannot apply for Annual/Casual leaves for more than 2 days",
    });
  }

  if (leave_type === "Prolonged Sick" && !base64) {
    return res.status(400).send({
      success: false,
      data: [],
      message:
        "Please upload your medical records to apply for prolonged sick leave",
    });
  }

  let isValid = true;
  let numberOfLeaves = 0;
  let medical_record = null;

  const leaves = await Leave.findAll({});
  leaves.map((currentLeave) => {
    if (
      (start_date >= currentLeave.start_date &&
        end_date <= currentLeave.end_date) ||
      (start_date <= currentLeave.start_date &&
        start_date <= currentLeave.end_date) ||
      (start_date >= currentLeave.start_date &&
        start_date <= currentLeave.end_date) ||
      (end_date >= currentLeave.start_date &&
        end_date <= currentLeave.end_date) ||
      (end_date >= currentLeave.start_date && end_date <= currentLeave.end_date)
    ) {
      console.log("Inside If");
      console.log(currentLeave);
      numberOfLeaves += 1;
    }
  });

  if (numberOfLeaves >= 2) isValid = false;
  if (!isValid) {
    return res.status(400).send({
      success: false,
      data: [],
      message:
        "Two employees have already requested for leaves in this range, please choose another date range",
    });
  }

  try {
    if (base64) {
      const base64Data = new Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      //const type = base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `leave/medical-records/${user_id}.${extension}`,
        Body: base64Data,
        ContentEncoding: "base64",
        //ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      medical_record = s3UploadResponse.Location;
    }
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
      hours,
      medical_record,
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
    hours,
    base64,
    extension,
  } = req.body;
  const id = req.params.id;

  try {
    let medical_record = null;

    if (base64) {
      const base64Data = new Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      //const type = base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `leave/medical-records/${user_id}.${extension}`,
        Body: base64Data,
        ContentEncoding: "base64",
        //ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      medical_record = s3UploadResponse.Location;
    }

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

    if (currentLeave.status !== "Pending") {
      return res.status(400).send({
        success: false,
        data: currentLeave,
        message: `This leave cannot be edited because it is ${currentLeave.status}`,
      });
    }

    if (leave_type === "Emergency" && !hours) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "You have chosen to take emergency leave, please enter the number of hours you want to take leave for",
      });
    }

    if (leave_type === "Annual/Casual" && no_of_days > 2) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "You cannot apply for Annual/Casual leaves for more than 2 days",
      });
    }

    if (leave_type === "Prolonged Sick" && !base64) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Please upload your medical records to apply for prolonged sick leave",
      });
    }

    let isValid = true;
    let numberOfLeaves = 0;

    const leaves = await Leave.findAll();
    leaves.map((currentLeave) => {
      if (
        (start_date >= currentLeave.start_date &&
          end_date <= currentLeave.end_date) ||
        (start_date <= currentLeave.start_date &&
          start_date <= currentLeave.end_date) ||
        (start_date >= currentLeave.start_date &&
          start_date <= currentLeave.end_date) ||
        (end_date >= currentLeave.start_date &&
          end_date <= currentLeave.end_date)
      ) {
        numberOfLeaves++;
      }
    });

    if (numberOfLeaves >= 2) isValid = false;
    if (!isValid) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Two employees have already requested for leaves in this range, please choose another date range",
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
        hours,
        medical_record: base64 ? medical_record : currentLeave.medical_record,
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
