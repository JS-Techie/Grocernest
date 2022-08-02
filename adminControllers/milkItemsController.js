const uniqid = require("uniqid");

const db = require("../models");
const MilkItems = db.MilkItemsModel;
const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../config/s3Config");

const s3 = new S3(s3Config);

const getAllItems = async (req, res, next) => {
  try {
    const allItems = await MilkItems.findAll({});

    if (allItems.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no items to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: allItems,
      message: "Fetched all items successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching items, please check data field for more details",
    });
  }
};

const getItemByID = async (req, res, next) => {
  const { itemID } = req.params;
  try {
    const existingItem = await MilkItems.findOne({
      where: { item_id: itemID },
    });

    if (!existingItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      data: existingItem,
      message: "Fetched item details successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching item details, please check data field for more details",
    });
  }
};

const createItem = async (req, res, next) => {
  const {
    brand,
    type,
    weight,
    cost_price,
    selling_price,
    MRP,
    CGST,
    SGST,
    IGST,
    other_tax,
    discount,
    UOM,
    is_percentage,
    base64,
  } = req.body;

  try {
    //upload base64 image to AWS and assign image to the URL
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    //const type = base64.split(";")[0].split("/")[1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile/images/${uniqid()}.jpeg`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/jpeg`,
    };

    const s3UploadResponse = await s3.upload(params).promise();
    const url = s3UploadResponse.Location;

    const newItem = await MilkItems.create({
      item_id: uniqid(),
      brand,
      type,
      weight,
      cost_price,
      selling_price,
      MRP,
      CGST,
      SGST,
      IGST,
      other_tax,
      discount,
      UOM,
      is_percentage: is_percentage === true ? 1 : null,
      created_by: 1,
      updated_by: 1,
      image: url,
    });

    return res.status(201).send({
      success: true,
      data: newItem,
      message: "New item successfully created",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "New Item could not be created, pleaase check data field for more details",
    });
  }
};

const editItem = async (req, res, next) => {
  const { itemID } = req.params;
  const {
    brand,
    type,
    weight,
    cost_price,
    selling_price,
    MRP,
    CGST,
    SGST,
    IGST,
    other_tax,
    discount,
    UOM,
    base64,
  } = req.body;

  try {
    //If image, upload to AWS and assign URL to image
    let url;
    if (base64) {
      const base64Data = new Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      //const type = base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `profile/images/${uniqid()}.jpeg`,
        Body: base64Data,
        ContentEncoding: "base64",
        ContentType: `image/jpeg`,
      };

      const s3UploadResponse = await s3.upload(params).promise();
      url = s3UploadResponse.Location;
    }

    const existingItem = await MilkItems.findOne({
      where: { item_id: itemID },
    });

    if (!existingItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist",
      });
    }

    const update = await MilkItems.update(
      {
        brand,
        type,
        weight,
        cost_price,
        selling_price,
        MRP,
        CGST,
        SGST,
        IGST,
        other_tax,
        discount,
        UOM,
        image: url,
      },
      { where: { item_id: itemID } }
    );

    const updatedItem = await MilkItems.findOne({
      where: { item_id: itemID },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldItem: existingItem,
        updatedItem,
        updatedRows: update,
      },
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while updating item details, please check data field for more details",
    });
  }
};

const deleteItem = async (req, res, next) => {
  const { itemID } = req.params;
  try {
    const existingItem = await MilkItems.findOne({
      where: { item_id: itemID },
    });
    if (!existingItem) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item does not exist",
      });
    }
    const deleted = await MilkItems.destroy({
      where: { item_id: itemID },
    });

    return res.status(200).send({
      success: true,
      data: {
        deletedItem: existingItem,
        numberOfRowsDeleted: deleted,
      },
      message: "Requested item deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Could not delete requested item, please check data field for more details",
    });
  }
};

module.exports = {
  getAllItems,
  getItemByID,
  createItem,
  editItem,
  deleteItem,
};
