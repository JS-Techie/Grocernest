const db = require("../../models");

const Attendance = db.AttendanceModel;
const User = db.UserModel;

const getAttendanceDetails = async (req, res, next) => {
  try {
    const attendanceDetails = await Attendance.findAll({});

    if (attendanceDetails.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There is no time registered",
      });
    }

    const promises = attendanceDetails.map(async (current) => {
      const currentUser = await User.findOne({
        where: { id: current.user_id },
      });

      return {
        current,
        currentUser,
      };
    });

    const resolvedArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: resolvedArray,
      message: "Found all attendance registered",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const getAttendanceByUserId = async (req, res, next) => {
  const { id } = req.params;

  try {
    const attendance = await Attendance.findAll({
      where: { user_id: id },
    });

    if (!attendance) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Current attendance details not found for current user",
      });
    }

    const userDetails = await User.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: {
        userDetails,
        attendance,
      },
      message: "Found all attendance details for current user",
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
  getAttendanceDetails,
  getAttendanceByUserId,
};
