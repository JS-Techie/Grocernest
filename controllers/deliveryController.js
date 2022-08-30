const { sequelize } = require("../models");
const db = require("../models");
const Delivery = db.MilkDeliveryModel;

const {
  getAllDeliveriesOfCurrentDeliveryBoy,
  getStatusWiseDeliveriesOfCurrentDeliveryBoy,
  getSingleSubscriptionDetailsOfCurrentDeliveryBoy,
} = require("../utils/serviceLayers/milkDelivery");

const getAllDeliveries = async (req, res, next) => {
  //get current delivery boy from JWT
  const current = req.delivery_boy;
  try {

    const [deliveries,metadata] = await sequelize.query(getAllDeliveriesOfCurrentDeliveryBoy(current));
    if (deliveries.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no deliveries for you currently",
      });
    }

    //do formatting here based on result

    return res.status(200).send({
      success: true,
      data: deliveries,
      message: "Fetched all your deliveries successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching deliveries for current delivery boy, please check data field for more details",
    });
  }
};

const getDeliveryById = async (req, res, next) => {
  //get current delivery boy from JWT
  const current = req.delivery_boy
  const { id } = req.params;
  try {
    const [currentDelivery,metadata] = await sequelize.query(
      getSingleSubscriptionDetailsOfCurrentDeliveryBoy(current, id)
    );
    if (currentDelivery.length === 0) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested delivery not found for current delivery boy",
      });
    }

    //do formatting here based on result

    return res.status(200).send({
      success: true,
      data: currentDelivery,
      message: "Successfully fetched details of current delivery",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching current delivery for current delivery boy, please check data field for more details",
    });
  }
};

const getDeliveriesByStatus = async (req, res, next) => {
  //get current delivery boy from JWT
  const current = req.delivery_boy
  const { status } = req.params;
  try {
    const [deliveries,metadata] = await sequelize.query(
      getStatusWiseDeliveriesOfCurrentDeliveryBoy(current, status)
    );
    if (deliveries.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: `There are no ${status} deliveries for current delivery boy`,
      });
    }

    //do formatting here based on result

    return res.status(200).send({
      success: true,
      data: deliveries,
      message: `Successfully Fetched ${status} deliveries for current delivery boy`,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching deliveries for current delivery boy, please check data field for more details",
    });
  }
};

const modifyDeliveryStatus = async (req, res, next) => {
  //get current delivery boy from JWT
  const current = req.delivery_boy
  const { id } = req.params;
  const { status, reason } = req.body;

  try {
    const existingDelivery = await Delivery.findOne({
      where: {
        id,
        delivery_boy : current
      },
    });

    if (!existingDelivery) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested delivery does not exist",
      });
    }

    const update = await Delivery.update(
      {
        status,
        reason,
      },
      {
        where: {
          id,
          delivery_boy : current
        },
      }
    );

    const updatedDelivery = await Delivery.findOne({
      where: {
        id,
        delivery_boy : current
      },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldDeliveryStatus: existingDelivery,
        newDeliveryStatus: updatedDelivery,
        numberOfRowsUpdated: update,
      },
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while modifying current delivery for current delivery boy, please check data field for more details",
    });
  }
};

module.exports = {
  getAllDeliveries,
  getDeliveriesByStatus,
  getDeliveryById,
  modifyDeliveryStatus,
};
