const db = require("../models");

const Offers = db.OffersModel;

const getAllOffers = async (req, res, next) => {
  //Get current user from JWT

  try {
    //Get all offers
    const offers = await Offers.findAll();

    if (offers.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no offers right now",
      });
    }

    const promises = offers.map(async (current) => {
      return {
        offerID: current.id,
        offerType: current.type,
        itemX: current.item_id_1 ? current.item_id_1 : "",
        quantityOfItemX: current.item_1_quantity ? current.item_1_quantity : "",
        itemY: current.item_id_2 ? current.item_id_2 : "",
        quantityOfItemY: current.item_2_quantity ? current.item_2_quantity : "",
        itemID: current.item_id ? current.item_id : "",
        amountOfDiscount: current.amount_of_discount
          ? current.amount_of_discount
          : "",
        isPercentage: current.is_percentage ? true : false,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all offers",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const getOfferById = async (req, res, next) => {
  //Get current user from JWT

  //get offer id from params
  const offerID = req.params.id;
  try {
    const current = await Offers.findOne({
      where: { id: offerID },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        offerID: current.id,
        offerType: current.type,
        itemX: current.item_id_1 ? current.item_id_1 : "",
        quantityOfItemX: current.item_1_quantity ? current.item_1_quantity : "",
        itemY: current.item_id_2 ? current.item_id_2 : "",
        quantityOfItemY: current.item_2_quantity ? current.item_2_quantity : "",
        itemID: current.item_id ? current.item_id : "",
        amountOfDiscount: current.amount_of_discount
          ? current.amount_of_discount
          : "",
          isPercentage: current.is_percentage ? true : false,
      },
      message: "Requested offer found",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const createOffer = async (req, res, next) => {
  //Get current user from JWT

  const {
    type,
    item_id_1,
    item_id_2,
    item_1_quantity,
    item_2_quantity,
    item_id,
    amount_of_discount,
    is_percentage,
  } = req.body;

  if (!type) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter the type of offer",
    });
  }
  try {
    const newOffer = await Offers.create({
      type,
      item_id_1,
      item_id_2,
      item_1_quantity,
      item_2_quantity,
      item_id,
      amount_of_discount,
      is_percentage: is_percentage === true ? 1 : null,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newOffer,
      message: "New offer successfully created",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const updateOffer = async (req, res, next) => {
  //Get current user from JWT

  const offerID = req.params.id;

  const {
    type,
    item_id_1,
    item_id_2,
    item_1_quantity,
    item_2_quantity,
    item_id,
    amount_of_discount,
    is_percentage,
  } = req.body;

  try {
    const current = await Offers.findOne({
      where: { id: offerID },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    const update = await Offers.update(
      {
        type,
        item_id_1,
        item_id_2,
        item_1_quantity,
        item_2_quantity,
        item_id,
        amount_of_discount,
        is_percentage: is_percentage === true ? 1 : null,
      },
      {
        where: { id: offerID },
      }
    );

    const updatedOffer = await Offers.findOne({
      where: { id: offerID },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldOffer: {
          offerID: current.id,
          offerType: current.type,
          itemX: current.item_id_1 ? current.item_id_1 : "",
          quantityOfItemX: current.item_1_quantity
            ? current.item_1_quantity
            : "",
          itemY: current.item_id_2 ? current.item_id_2 : "",
          quantityOfItemY: current.item_2_quantity
            ? current.item_2_quantity
            : "",
          itemID: current.item_id ? current.item_id : "",
          amountOfDiscount: current.amount_of_discount
            ? current.amount_of_discount
            : "",
          isPercentage: current.is_percentage
            ? current.is_percentage === 1
              ? true
              : false
            : "",
        },
        newOffer: {
          offerID: updatedOffer.id,
          offerType: updatedOffer.type,
          itemX: updatedOffer.item_id_1 ? updatedOffer.item_id_1 : "",
          quantityOfItemX: updatedOffer.item_1_quantity
            ? updatedOffer.item_1_quantity
            : "",
          itemY: updatedOffer.item_id_2 ? updatedOffer.item_id_2 : "",
          quantityOfItemY: updatedOffer.item_2_quantity
            ? updatedOffer.item_2_quantity
            : "",
          itemID: updatedOffer.item_id ? updatedOffer.item_id : "",
          amountOfDiscount: updatedOffer.amount_of_discount
            ? updatedOffer.amount_of_discount
            : "",
          isPercentage: updatedOffer.is_percentage
            ? updatedOffer.is_percentage === 1
              ? true
              : false
            : "",
        },
        numberOfOffersUpdated: update,
      },
      message: "Offer updated successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field for more details",
    });
  }
};

const deleteOffer = async (req, res, next) => {
  //Get current user from JWT

  //get offer id from params
  const offerID = req.params.id;
  try {
    const current = await Offers.findOne({
      where: { id: offerID },
    });

    if (!current) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested offer not found",
      });
    }

    const deletedOffer = await Offers.destroy({
      where: { id: offerID },
    });

    return res.status(200).send({
      success: true,
      data: {
        deletedOffer: {
          offerID: current.id,
          offerType: current.type,
          itemX: current.item_id_1 ? current.item_id_1 : "",
          quantityOfItemX: current.item_1_quantity
            ? current.item_1_quantity
            : "",
          itemY: current.item_id_2 ? current.item_id_2 : "",
          quantityOfItemY: current.item_2_quantity
            ? current.item_2_quantity
            : "",
          itemID: current.item_id ? current.item_id : "",
          amountOfDiscount: current.amount_of_discount
            ? current.amount_of_discount
            : "",
          isPercentage: current.is_percentage
            ? current.is_percentage === 1
              ? true
              : false
            : "",
        },
        numberOfOffersDeleted: deletedOffer,
      },
      message: "Offer deleted successfully",
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
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
