const db = require("../../models");
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");

const Item = db.ItemModel;
const s3 = new S3(s3Config);

const uploadMultipleImages = async (req, res, next) => {
  const { id, uploadedImages } = req.params;
  try {
    const currentItem = await Item.findOne({
      where: { id },
    });

    if (!currentItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item not found",
      });
    }

    if (uploadedImages.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please upload the images for this item",
      });
    }

    const promises = uploadedImages.map(async (currentImage) => {
      const base64Data = new Buffer.from(
        currentImage.base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      //const type = base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `item/images/${id}-${currentImage.serialNumber}.${currentImage.extension}`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      const url = s3UploadResponse.Location;

      return {
        imageName: currentImage.name,
        url,
        serialNumber: currentImage.serialNumber,
      };
    });

    const images = await Promise.all(promises);

    const updateItem = await Item.update(
      {
        image: JSON.stringify(images),
      },
      {
        where: { id },
      }
    );

    return res.status(200).send({
      success: true,
      data: images,
      message: "Successfully uploaded images for the item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

module.exports = {
  uploadMultipleImages,
};
