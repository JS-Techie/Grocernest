const db = require("../models");

const Attendance = db.AttendanceModel;

const registerLoginTime = async (req, res, next) => {
  const { user_id } = req;

  try {
    const newAttendance = await Attendance.create({
      user_id,
      login_time: new Date(),
      logout_time: null,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newAttendance,
      message: "Successfully recorded login time for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Check data field for more details",
    });
  }
};

const registerLogoutTime = async (req, res, next) => {
  const { user_id } = req;

  try {
    const attendances = await Attendance.findAll({
      where: { user_id },
    });

    if (attendances.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "attendance not found for current user",
      });
    }

    attendances.map(async (current) => {
      await Attendance.update(
        {
          logout_time: new Date(),
        },
        {
          where: {
            id: current.id,
          },
        }
      );
    });

    return res.status(200).send({
      success: true,
      data: attendances,
      message: "Updated logout time for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Check data field for more details",
    });
  }
};

module.exports = {
  registerLoginTime,
  registerLogoutTime,
};
