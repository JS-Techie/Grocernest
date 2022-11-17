const db = require("../../models");
const uniq = require("uniqid");
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");
const s3 = new S3(s3Config);

const FeaturedCategory = db.FeaturedCategoryModel;

const getAllFeaturedCategories = async (req, res, next) => {
  try {
    const categories = await FeaturedCategory.findAll({});

    if (categories.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no featured categories to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: categories,
      message: "Found all featured categories successfully",
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

const getFeaturedCategoryById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await FeaturedCategory.findOne({
      where: { id },
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested Featured category could not be found",
        devMessage: "The ID entered is incorrect, no mapping is present",
      });
    }

    return res.status(200).send({
      success: true,
      data: category,
      message: "Requested category found successfully",
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

const createFeaturedCategory = async (req, res, next) => {
  const { user_id } = req;
  const { base64, heading, desc, category_id, extension, name } = req.body;
  try {
    const id = uniq();
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Featured-Categories/Images/${id}-${category_id}-${name}.${extension}`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const url = s3UploadResponse.Location;

    const newFeaturedCategory = await FeaturedCategory.create({
      id,
      heading,
      desc,
      category_id,
      extension,
      name,
      created_by: user_id,
      active_ind: "Y",
      url,
    });

    return res.status(201).send({
      success: true,
      data: newFeaturedCategory,
      message: "Created new featured category successfully",
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

const editFeaturedCategory = async (req, res, next) => {
  const { id } = req.params;
  const { base64, heading, desc, category_id, extension, name, active_ind } =
    req.body;
  const { user_id } = req;
  try {
    let deleteSuccess = true;
    let errMessage = "";
    let url;

    const current = await FeaturedCategory.findOne({
      where: { id },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested featured category could not be found",
        devMessage: "ID Entered is incorrect",
      });
    }

    if (base64) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Featured-Categories/Images/${id}-${current.category_id}-${current.name}.${current.extension}`,
      };

      s3.deleteObject(params, (err, data) => {
        if (err) {
          deleteSuccess = false;
          errMessage = err;
        }
      });

      if (deleteSuccess) {
        const params2 = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `Featured-Categories/Images/${id}-${category_id}-${name}.${extension}`,
          Body: base64Data,
          ContentEncoding: "base64",
          ContentType: `image/jpeg`,
        };

        const s3UploadResponse = await s3.upload(params2).promise();
        url = s3UploadResponse.Location;
      } else {
        return res.status(400).send({
          success: false,
          data: [],
          message:
            "Could not delete already existing image, please try again in sometime",
          devMessage: errMessage,
        });
      }
    }

    const update = await FeaturedCategory.update(
      {
        heading,
        desc,
        category_id,
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

    const updated = await FeaturedCategory.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: updated,
      message: "Requested featured category updated successfully",
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

const deleteFeaturedCategory = async (req, res, next) => {
    const { id } = req.params;
  try {

    const current = await FeaturedCategory.findOne({
        where: { id },
      });
  
      if (!current) {
        return res.status(404).send({
          success: false,
          data: [],
          message: "Requested featured category could not be found",
          devMessage: "ID Entered is incorrect",
        });
      }
  
      let deleteSuccess = true;
      let errMessage = "";
  
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Featured-Categories/Images/${id}-${current.category_id}-${current.name}.${current.extension}`,
      };
  
      s3.deleteObject(params, (err, data) => {
        if (err) {
          deleteSuccess = false;
          errMessage = err;
        }
      });
  
      if (!deleteSuccess) {
        return res.status(400).send({
          success: false,
          data: [],
          message:
            "Could not delete already existing image, please try again in sometime",
          devMessage: errMessage,
        });
      }
  
      const deleted = await FeaturedCategory.destroy({
        where: { id },
      });
  
      return res.status(200).send({
        success: true,
        data: deleted,
        message: "Deleted Featured Category successfully",
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

module.exports = {
  getAllFeaturedCategories,
  getFeaturedCategoryById,
  createFeaturedCategory,
  editFeaturedCategory,
  deleteFeaturedCategory,
};
