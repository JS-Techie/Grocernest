const uniq = require("uniqid");

const db = require("../../models");
const Banner = db.BannerModel;

const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");
const s3 = new S3(s3Config);

const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({});

    if (banners.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no banners to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: banners,
      message: "Found all banners",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check the data field for more details",
    });
  }
};

const getBannerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const banner = await Banner.findOne({
      where: { id },
    });

    if (!banner) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Could not find requested banner details",
      });
    }

    return res.status(200).send({
      success: true,
      data: banner,
      message: "Found details for the requested banner successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check the data field for more details",
    });
  }
};

const createBanner = async (req, res, next) => {
  const { user_id } = req;
  const { name, base64, size, extension } = req.body;

  try {
    const id = uniq();

    if (size !== "s" && size !== "b") {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Size entered is incorrect",
        devMessage: "Size entered is not s or b",
      });
    }

    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Banners/Images/${id}-${name}-${size}.${extension}`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const url = s3UploadResponse.Location;

    const newBanner = await Banner.create({
      id,
      name,
      size,
      extension,
      created_by: user_id,
      updated_by: user_id,
      active_ind: "Y",
      url,
    });

    return res.status(201).send({
      success: true,
      data: newBanner,
      message: "New Banner created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check the data field for more details",
    });
  }
};

const deleteBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const banner = await Banner.findOne({
      where: { id },
    });

    if (!banner) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Could not find rrquested banner image",
      });
    }
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Banners/Images/${id}-${current.name}-${current.size}.${current.extension}`,
    };

    let deleteSuccess = true;
    let errMessage = "";
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
          "Requested banner could not be deleted, please try again in sometime",
        devMessage: `Deletiom from s3 failed because ${errMessage}`,
      });
    }

    await Banner.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: banner,
      message: "Requested banner deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check the data field for more details",
    });
  }
};

module.exports = {
  getAllBanners,
  getBannerById,
  createBanner,
  deleteBanner,
};

//bestseller
//homepage - create - inage,brand_id,text1,text2
//view all
//items based on brands - brand id
