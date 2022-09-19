const db = require("../models");

const Attendance = db.AttendanceModel;

const registerLoginTime = async (req, res, next) => {
  const { user_id } = req;

  const today = new Date()
    .toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  try {
    const attendanceExists = await Attendance.findOne({
      where: { user_id, date: today },
    });

    let newAttendance;
    if (!attendanceExists) {
      newAttendance = await Attendance.create({
        user_id,
        login_time: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        logout_time: null,
        created_by: 1,
        date: today,
      });
    }

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
  const today = new Date()
    .toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[0];

  try {
    const attendanceExists = await Attendance.findOne({
      where: { date: today, user_id },
    });

    if (!attendanceExists) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "You have not registered your login time for today",
      });
    }

    await Attendance.update(
      {
        logout_time: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      },
      {
        where: { user_id, date: today },
      }
    );

    const updated = await Attendance.findOne({
      where: { date: today, user_id },
    });

    return res.status(200).send({
      success: true,
      data: updated,
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
