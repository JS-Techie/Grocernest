const uniq = require("uniqid");

const db = require("../../models");
const {
  uploadImageToS3,
  deleteImageFromS3,
} = require("../../services/s3Service");

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
    const key = `Featured-Categories/Images/${id}-${category_id}-${name}.${extension}`;
    const url = await uploadImageToS3(base64, key);

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
      const deleteKey = `Featured-Categories/Images/${id}-${current.category_id}-${current.name}.${current.extension}`;
      const deletionFromS3 = await deleteImageFromS3(deleteKey);

      if (deletionFromS3.deleteSuccess) {
        const uploadKey = `Featured-Categories/Images/${id}-${category_id}-${name}.${extension}`;
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

    const key = `Featured-Categories/Images/${id}-${current.category_id}-${current.name}.${current.extension}`;

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
