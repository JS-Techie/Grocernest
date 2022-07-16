const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");

const Offers = db.OffersModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Cart = db.CartModel;

const offerForItem = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;

  const { itemID, quantity } = req.body;

  try {
    const offer = await Offers.findOne({
      where: {
        [Op.or]: [{ item_id_1: itemID }, { item_id: itemID }],
      },
    });
    if (!offer) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No offers exist for this item",
      });
    }

    let itemToBeAdded = null;
    let quantityToBeAdded = null;
    let discount = null;
    let isPercentage = null;
    let response = null;
    let newSalePrice = null;

    if (offer.item_id_1) {
      itemToBeAdded = offer.item_id_2;

      if (quantity >= offer.item_1_quantity) {
        if (quantity % offer.item_1_quantity !== 0) {
          quantityToBeAdded = (quantity % offer.item_1_quantity) * offer.item_2_quantity ;
        } else if (quantity % offer.item_1_quantity === 0) {
          quantityToBeAdded = (quantity / offer.item_1_quantity) * offer.item_2_quantity;
        }
      } else {
        return res.status(200).send({
          success: true,
          data: [],
          message: "More items need to be added to avail offer",
        });
      }
      response = await Cart.create({
        cust_no: currentUser,
        item_id: itemToBeAdded,
        quantity: quantityToBeAdded,
        created_by: 1,
        is_offer: 1,
        offer_item_price: 0,
      });

      return res.status(201).send({
        success: true,
        data: response,
        message: "Offer successfully applied and items added to cart",
      });
    }

    const batches = await Batch.findAll({
      where: { item_id: itemID },
    });
    const oldestBatch = batches[0];
    discount = offer.amount_of_discount;
    isPercentage = offer.is_percentage;

    if (isPercentage) {
      newSalePrice =
        oldestBatch.sale_price - (discount / 100) * oldestBatch.sale_price;
    } else {
      newSalePrice = oldestBatch.sale_price - discount;
    }

    response = await Cart.create({
      cust_no: currentUser,
      item_id: itemID,
      quantity: 1,
      created_by: 1,
      is_offer: 1,
      offer_item_price: newSalePrice,
    });

    return res.status(201).send({
      success: true,
      data: response,
      message: "Offer successfully applied and items added to cart",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while applying offer items, please check data field for more details",
    });
  }
};

module.exports = {
  offerForItem,
};
