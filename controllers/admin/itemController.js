const db = require("../../models");
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../../config/s3Config");
const uniq = require("uniqid");
const { sequelize } = require("../../models");
const { getItemTaxArray } = require("../../services/itemsResponse");
const Item = db.ItemModel;
const Batch = db.BatchModel;
const s3 = new S3(s3Config);

const uploadMultipleImages = async (req, res, next) => {
  const { id, uploadedImages } = req.body;
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
      await Item.update(
        {
          image: JSON.stringify([]),
        },
        {
          where: { id },
        }
      );
      return res.status(200).send({
        success: true,
        data: [],
        message: "Item has been uploaded without any images",
      });
    }

    const promises = uploadedImages.map(async (currentImage, index) => {
      const base64Data = new Buffer.from(
        currentImage.base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      //const type = base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `item/images/${uniq()}-${id}-${currentImage.serialNumber}.${
          currentImage.extension
        }`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      const url = s3UploadResponse.Location;

      return {
        imageName: currentImage.name,
        url,
        serialNumber: index + 1,
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

const editUploadedImages = async (req, res, next) => {
  const { id, uploadedImages } = req.body;

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

    // if (!uploadedImages) {
    //   return res.status(404).send({
    //     success: false,
    //     data: [],
    //     message: "Please upload the images",
    //   });
    // }

    if (uploadedImages.length === 0) {
      await Item.update(
        {
          image: JSON.stringify([]),
        },
        {
          where: { id },
        }
      );

      return res.status(200).send({
        success: true,
        data: [],
        message: "Successfully deleted the images",
      });
    }

    const promises = uploadedImages.map(async (currentImage) => {
      let currentImageUrl = "";

      if (currentImage.edit) {
        const base64Data = new Buffer.from(
          currentImage.base64.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `item/images/${uniq()}-${id}-${currentImage.serialNumber}.${
            currentImage.extension
          }`,
          Body: base64Data,
          ContentEncoding: "base64",
          ContentType: `image/jpeg`,
        };

        const s3UploadResponse = await s3.upload(params).promise();
        const url = s3UploadResponse.Location;
        currentImageUrl = url;
      } else {
        currentImageUrl = currentImage.url;
      }

      return {
        serialNumber: currentImage.serialNumber,
        url: currentImageUrl,
        imageName: currentImage.name,
      };
    });

    const resolved = await Promise.all(promises);

    const updated = await Item.update(
      {
        image: JSON.stringify(resolved),
      },
      {
        where: { id },
      }
    );

    return res.status(200).send({
      success: true,
      data: resolved,
      message: "Successfully edited the order of the images",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const deleteImage = async (req, res, next) => {
  const { id, image } = req.body;
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

    if (!image) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested image not found",
      });
    }

    const images = JSON.parse(currentItem.image);

    if (images.length === 0 || !images) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "There are no images uploaded for this image",
      });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `item/images/${uniq()}-${id}-${image.serialNumber}.${
        image.extension
      }`,
    };

    let deleteSuccess = true;
    s3.deleteObject(params, (err, data) => {
      if (err) {
        deleteSuccess = false;
      }
    });

    if (!deleteSuccess) {
      return res.status(400).send({
        success: false,
        data: [],
        message:
          "Something went wrong while deleting the document, please try again in sometime",
      });
    }

    const currentImageToBeDeleted = {
      imageName: image.name,
      url: image.url,
      serialNumber: image.serialNumber,
    };

    const updatePromiseArray = await images.filter((current) => {
      return current !== currentImageToBeDeleted;
    });
    const updateArrayResolved = await Promise.all(updatePromiseArray);

    const updated = await Item.update(
      {
        image: JSON.stringify(updateArrayResolved),
      },
      {
        where: { id },
      }
    );

    return res.status(200).send({
      success: true,
      data: updateArrayResolved,
      message: "Successfully deleted requested image",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const referenceItem = async (req, res, next) => {
  const { images, id } = req.body;
  try {
    if (images.length === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please select the reference images",
      });
    }

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

    const uploadedImages = images.map((current, index) => {
      return {
        imageName: current.imageName,
        url: current.url,
        serialNumber: index + 1,
      };
    });

    const update = await Item.update(
      {
        image: JSON.stringify(uploadedImages),
      },
      {
        where: { id },
      }
    );

    const updatedItemDetails = await Item.findOne({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: updatedItemDetails,
      message: "Successfully updated image of requested item",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const getLastThreeItemBatches = async (req, res, next) => {
  const { item_id } = req.params;
  try {
    if (!item_id) {
      return res.status(400).send({
        status: 400,
        message: "Item id not found",
        data: [],
      });
    }
    const availableBatches = await Batch.findAll({
      where: { item_id, location_id: 4 },
      order: [["created_at", "DESC"]],
      limit: 3,
    });
    if (availableBatches.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Requested item doesnot have any batches",
        data: [],
      });
    }

    const responsePromises = availableBatches.map(async (currentBatch) => {
      const taxDetailsDB = await GrnDetails.findAll({
        where: { item_id, BATCH_NO: currentBatch.batch_no },
      });

      let taxDetailsPromises = [];
      if (taxDetailsDB.length > 0) {
        taxDetailsPromises = taxDetailsDB.map((currentDetails) => {
          return {
            cgst: currentDetails.cgst,
            sgst: currentDetails.sgst,
            igst: currentDetails.igst,
            otherTax: currentDetails.other_tax,
            supplierDiscount: currentDetails.supplier_disc,
            basePrice: currentDetails.base_price,
            shelfNo: currentDetails.shelf_no,
          };
        });
      }

      const taxDetails = await Promise.all(taxDetailsPromises);

      return {
        batchId: currentBatch.id,
        batchNo: currentBatch.batch_no,
        MRP: currentBatch.MRP,
        discount: currentBatch.discount,
        costPrice: currentBatch.cost_price,
        salePrice: currentBatch.sale_price,
        mfgDate: currentBatch.mfg_date,
        expiryDate: currentBatch.expiry_date,
        createdAt: currentBatch.created_at,
        taxDetails,
      };
    });

    const response = await Promise.all(responsePromises);

    return res.status(200).send({
      success: true,
      message:
        "Successssfully fetched last three batches of the requested item id",
      data: {
        availableBatches: response,
      },
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Something went wrong , please try agian later",
      data: error.message,
    });
  }
};

module.exports = {
  uploadMultipleImages,
  editUploadedImages,
  deleteImage,
  referenceItem,
  getLastThreeItemBatches,
};

// const currentItemDetails = await Item.findOne({ where: { id: current } });
// const referenceItemDetails = await Item.findOne({
//   where: { id: reference },
// });

// if (!currentItemDetails) {
//   return res.status(404).send({
//     success: false,
//     data: [],
//     message: "Could not find the details for the current item",
//   });
// }

// if (!referenceItemDetails) {
//   await Item.update(
//     {
//       image: JSON.stringify([]),
//     },
//     {
//       where: { id: current },
//     }
//   );
//   return res.status(404).send({
//     success: false,
//     data: [],
//     message: "Could not find the details for the reference item",
//   });
// }

// const update = await Item.update(
//   {
//     image: referenceItemDetails.image,
//   },
//   {
//     where: { id: current },
//   }
// );

// const updatedItemDetails = await Item.findOne({
//   where: { id: current },
// });
