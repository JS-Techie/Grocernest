const db = require("../../models");
const uniq = require("uniqid");

const FeaturedBrand = db.FeaturedBrandsModel;

const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");
const s3 = new S3(s3Config);

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

const getFeaturedBrandById = async (req, res, next) => {
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
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Featured-Brands/Images/${id}-${brand_id}-${name}.${extension}`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const url = s3UploadResponse.Location;

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
    let deleteSuccess = true;
    let errMessage = "";
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
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Featured-Brands/Images/${id}-${current.brand_id}-${current.name}.${current.extension}`,
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
          Key: `Featured-Brands/Images/${id}-${brand_id}-${name}.${extension}`,
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

    let deleteSuccess = true;
    let errMessage = "";

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Featured-Brands/Images/${id}-${current.brand_id}-${current.name}.${current.extension}`,
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

module.exports = {
  getAllFeaturedBrands,
  getFeaturedBrandById,
  createFeaturedBrand,
  editFeaturedBrand,
  deleteFeaturedBrand,
};
