const db = require("../../models");

const User = db.UserModel;
const UserRole = db.UserRoleModel;

const getAllDeliveryBoys = async (req, res, next) => {
  try {
    const allUsersWithRoleIdFour = await UserRole.findAll({
      where: { role_id: 4 },
    });

    if (allUsersWithRoleIdFour.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no delivery boys",
      });
    }

    const promises = allUsersWithRoleIdFour.map(async (currentUser) => {
      const currentUserDetails = await User.findOne({
        where: { id: currentUser.user_id },
      });

      return currentUserDetails;
    });

    const resolvedArray = await Promise.resolve(promises);

    return res.status(200).send({
      success: true,
      data: resolvedArray,
      message: "Successfully fetched delivery boys",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for more details",
    });
  }
};

const sendMessageToDeliveryBoy = async (req, res, next) => {
  const { orderId, user_id } = req.body;

  try {
    //find phone number of current delivery boy
    const currentUser = await User.findOne({
      where: { id: user_id },
    });

    //send whatsapp message to that deilvery boy

    return res.status(200).send({
      success: true,
      data: [],
      message: "Successfully sent message to the delivery boy",
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
  getAllDeliveryBoys,
  sendMessageToDeliveryBoy,
};
