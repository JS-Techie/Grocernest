const db = require("../../models");
const uniq = require("uniqid");

const {
  uploadImageToS3,
  deleteImageFromS3,
} = require("../../services/s3Service");
const { sequelize } = require("../../models");

const {
  sendNotificationsToUser,
} = require("../../services/whatsapp/whatsappMessages");
const FeaturedBrand = db.FeaturedBrandsModel;
const Demand = db.DemandModel;
const Notify = db.NotifyModel;

const getAllFeaturedBrands = async (req, res, next) => {
  try {
    const brands = await FeaturedBrand.findAll({});

    if (brands.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no featured brands to show right now",
      });
    }

    brands.sort(function (a, b) {
      return a.serial_no - b.serial_no;
    });

    return res.status(200).send({
      success: true,
      data: brands,
      message: "Found all featured brands successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const reorderAllFeaturedBrands = async (req, res, next) => {
  let reOrderedData = req.body.reOrderedData;

  if (reOrderedData.length == 0) {
    return res.status(400).send({
      success: false,
      data: "",
      message: "No data available to sort Brands.",
    });
  }

  try {
    reOrderedData.map(async (current_brand_card, index) => {
      await FeaturedBrand.update(
        {
          serial_no: index,
        },
        { where: { id: current_brand_card.id } }
      );
    });

    return res.status(200).send({
      success: true,
      data: "",
      message: "Featured Brands are sorted successfully",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "Something went wrong while sorting Brands",
    });
  }
};

const getFeaturedBrandById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const brand = await FeaturedBrand.findOne({
      where: { id },
    });

    if (!brand) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested Featured Brand could not be found",
        devMessage: "The ID entered is incorrect, no mapping is present",
      });
    }

    return res.status(200).send({
      success: true,
      data: brand,
      message: "Requested featured brand found successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const createFeaturedBrand = async (req, res, next) => {
  const { user_id } = req;
  const { base64, heading, desc, brand_id, extension, name } = req.body;
  try {
    const id = uniq();
    const key = `Featured-Brands/Images/${id}-${brand_id}-${name}.${extension}`;
    const url = await uploadImageToS3(base64, key);

    const newFeaturedBrand = await FeaturedBrand.create({
      id,
      heading,
      desc,
      brand_id,
      extension,
      name,
      created_by: user_id,
      active_ind: "Y",
      url,
    });

    return res.status(201).send({
      success: true,
      data: newFeaturedBrand,
      message: "Created new featured brand successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const editFeaturedBrand = async (req, res, next) => {
  const { id } = req.params;
  const { base64, heading, desc, brand_id, extension, name, active_ind } =
    req.body;
  const { user_id } = req;
  try {
    let url;

    const current = await FeaturedBrand.findOne({
      where: { id },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested featured brand could not be found",
        devMessage: "ID Entered is incorrect",
      });
    }

    if (base64) {
      const deleteKey = `Featured-Brands/Images/${id}-${current.brand_id}-${current.name}.${current.extension}`;
      const deletionFromS3 = await deleteImageFromS3(deleteKey);

      if (deletionFromS3.deleteSuccess) {
        const uploadKey = `Featured-Brands/Images/${id}-${brand_id}-${name}.${extension}`;
        url = await uploadImageToS3(base64, uploadKey);
      } else {
        return res.status(400).send({
          success: false,
          data: [],
          message:
            "Could not delete already existing image, please try again in sometime",
          devMessage: deletionFromS3.errMessage,
        });
      }
    }

    const update = await FeaturedBrand.update(
      {
        heading,
        desc,
        brand_id,
        extension,
        name,
        updated_by: user_id,
        active_ind,
        url: base64 ? url : current.url,
      },
      {
        where: { id },
      }
    );

    const updated = await FeaturedBrand.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: updated,
      message: "Requested featured brand updated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const deleteFeaturedBrand = async (req, res, next) => {
  const { id } = req.params;
  try {
    const current = await FeaturedBrand.findOne({
      where: { id },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested featured brand could not be found",
        devMessage: "ID Entered is incorrect",
      });
    }

    const key = `Featured-Brands/Images/${id}-${current.brand_id}-${current.name}.${current.extension}`;

    const deletionFromS3 = await deleteImageFromS3(key);

    if (!deletionFromS3.deleteSuccess) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Could not delete already existing image, please try again in sometime",
        devMessage: deletionFromS3.errMessage,
      });
    }

    const deleted = await FeaturedBrand.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: deleted,
      message: "Deleted Featured Brand successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const getDemandList = async (req, res, next) => {
  try {
    const [demands, metadata] = await sequelize.query(
      `select t_demand.title,t_demand.desc,t_demand.url,t_customer.cust_name,t_customer.email,t_customer.contact_no from t_demand inner join t_customer on t_customer.cust_no = t_demand.cust_no order by t_demand.created_at desc`
    );

    if (demands.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no customer demands right now",
      });
    }

    const promises = demands.map((current) => {
      return {
        title: current.title,
        description: current.desc,
        image: current.url,
        customerName: current.cust_name,
        customerEmail: current.email ? current.email : "",
        phoneNumber: current.contact_no,
      };
    });

    const resolved = await Promise.resolve(promises);

    return res.status(200).send({
      success: true,
      data: resolved,
      message: "Successfully found customer demand list",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for more details",
    });
  }
};

const sendNotification = async (req, res, next) => {
  const { id } = req.body;
  try {
    const [notifs, metadata] = await sequelize.query(
      `select t_customer.cust_name, t_customer.contact_no,t_item.name from ((t_notify inner join t_customer on t_customer.cust_no = t_notify.cust_no) inner join t_item on t_item.id = t_notify.item_id) where t_notify.item_id = ${id}`
    );

    if (notifs.length > 0) {
      notifs.map((current) => {
        sendNotificationsToUser(
          current.name,
          current.contact_no,
          current.cust_name
        );
      });
    }

    const [deleteResults, metadata2] = await sequelize.query(
      `delete from t_notify where item_id = ${id}`
    );

    return res.status(200).send({
      success: true,
      data: deleteResults,
      message: "Successfully sent notifications to customer",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  getAllFeaturedBrands,
  getFeaturedBrandById,
  createFeaturedBrand,
  editFeaturedBrand,
  deleteFeaturedBrand,
  getDemandList,
  sendNotification,

  reorderAllFeaturedBrands,
};
