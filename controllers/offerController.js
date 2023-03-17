const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");

const Offers = db.OffersModel;
const Item = db.ItemModel;
const Batch = db.BatchModel;
const Cart = db.CartModel;
const OffersCache = db.OffersCacheModel;

const offerForItem = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;
  let { itemID, quantity } = req.body;

  try {
    const cart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemID },
    });
    if(cart) {
      quantity = cart.quantity + quantity;
    }
    const offer = await Offers.findAll({
      where: {
        is_active: 1,
        item_x: itemID,
        is_ecomm: 1
      },
    });
    if (!offer) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No offers exist for this item",
      });
    }
    //add item check
    let itemToBeAdded = null;
    let quantityToBeAdded = null;
    let discount = null;
    let isPercentage = null;
    let response = null;
    let newSalePrice = null;

    offer.map((eachOffer)=>{
      if(quantity === eachOffer.item_x_quantity){
        let type_id = eachOffer.type_id
          switch(type_id){
            case 1:
              itemToBeAdded = offer.item_y;
              if(quantity >= offer.item_x_quantity){
                quantityToBeAdded = Math.floor(quantity / offer.item_x_quantity) * offer.item_y_quantity;
                console.log("New quantity of item in cart ====>", quantity);
                console.log("New quantity of offer item in cart ====>",quantityToBeAdded );
                console.log("Xquantity ===>", offer.item_x_quantity);
                console.log("Yquantity====>", offer.item_y_quantity);   
              }
              break;
            case 2:
              itemToBeAdded = offer.item_x;
              discount = eachOffer.amount_of_discount
              isPercentage = eachOffer.is_percentage
              break;  
          }
        }
    })
    
    let offerItemInCart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemToBeAdded, is_offer: 1 },
    });

    if (offerItemInCart) {
      response = await Cart.update(
        {
          quantity: quantityToBeAdded,
        },
        {
          where: {
            cust_no: currentUser,
            item_id: itemToBeAdded,
            is_offer: 1,
          },
        }
      );
    } else {
      response = await Cart.create({
        cust_no: currentUser,
        item_id: itemToBeAdded,
        quantity: quantityToBeAdded,
        created_by: 1,
        is_offer: 1,
        offer_item_price: 0,
      });
    }

      return res.status(201).send({
        success: true,
        data: response,
        message: "Offer successfully applied and items added to cart",
      });
    }

    let oldestBatch = await Batch.findOne({
      where: { item_id: itemID, mark_selected: 1 },
    });

    if (!oldestBatch) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No batch is selected for current item",
      });
    }

    discount = offer.amount_of_discount;
    isPercentage = offer.is_percentage;

    if (isPercentage) {
      newSalePrice =
        oldestBatch.MRP - (discount / 100) * oldestBatch.MRP;
    } else {
      newSalePrice = oldestBatch.MRP - discount;
    }

    offerItemInCart = await Cart.findOne({
      where: { cust_no: currentUser, item_id: itemID, is_offer: 1 },
    });

    if (offerItemInCart) {
      response = await Cart.update(
        {
          quantity,
        },
        {
          where: { cust_no: currentUser, item_id: itemID, is_offer: 1 },
        }
      );
    } else {
      response = await Cart.create({
        cust_no: currentUser,
        item_id: itemID,
        quantity,
        created_by: 1,
        is_offer: 1,
        offer_item_price: newSalePrice,
      });
    }

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

const offerForItemBuyNow = async (req, res, next) => {
  //Get current user from JWT
  const currentUser = req.cust_no;

  //Get item id and quantity from request body
  const { itemID, quantity } = req.body;

  if (!itemID || !quantity) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter all required details",
    });
  }

  try {
    const offer = await Offers.findOne({
      where: {
        is_active: 1,
        item_x: itemID,
        [Op.or]: [{ type_id: 1 }, { type_id: 2 }],
        is_ecomm: 1,
      },
    });

    const currentItem = await Item.findOne({
      where: { id: itemID },
    });

    const oldestBatch = await Batch.findOne({
      where: { item_id: itemID, mark_selected: 1 },
    });

    if (!oldestBatch) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No batch is selected for current item",
      });
    }

    if (!offer) {
      return res.status(200).send({
        success: true,
        data: {
          itemName: currentItem.name,
          itemID,
          quantity,
          total: oldestBatch.sale_price * quantity,
        },
        message: "No offers exist for this item",
      });
    }
    let newSalePrice = null;
    let offerItemID = null;

    if (offer.item_x) {
      offerItemID = offer.item_y;

      const oldestBatch = await Batch.findOne({
        where: { item_id: itemID, mark_selected: 1 },
      });

      const Xitem = await Item.findOne({
        where: { id: offer.item_x },
      });

      const Yitem = await Item.findOne({
        where: { id: offerItemID },
      });

      let quantityOfOfferItem = null;
      if (quantity >= offer.item_x_quantity) {
        quantityOfOfferItem =
          Math.floor(quantity / offer.item_x_quantity) * offer.item_y_quantity;
      }

      const saveOfferItemInCache = await OffersCache.create({
        cust_no: currentUser,
        item_id: offerItemID,
        quantity: quantityOfOfferItem,
        created_by: 1,
      });
      return res.status(200).send({
        success: true,
        data: {
          normalItem: {
            itemName: Xitem.name,
            quantity,
          },
          offerItem:
            quantityOfOfferItem === null
              ? "Not enough items to avail offer"
              : {
                  itemName: Yitem.name,
                  quantity: Math.floor(quantityOfOfferItem),
                },
          total: oldestBatch.sale_price * quantity,
          DBresponse: saveOfferItemInCache,
        },
        message: "Offer successfully applied for current item",
      });
    }

    const offerItemFromDB = await Item.findOne({
      where: { id: offer.item_x },
    });

    let oldestBatchForOfferItem = await Batch.findOne({
      where: { item_id: offer.item_x, mark_selected: 1 },
    });

    if (offer.is_percentage) {
      newSalePrice =
        oldestBatchForOfferItem.sale_price -
        (offer.amount_of_discount / 100) * oldestBatchForOfferItem.sale_price;
    } else {
      newSalePrice =
        oldestBatchForOfferItem.sale_price - offer.amount_of_discount;
    }

    newSalePrice = newSalePrice * quantity;
    //console.log(newSalePrice, quantity, offer)

    return res.status(200).send({
      success: true,
      data: {
        itemName: offerItemFromDB.name,
        total: newSalePrice,
        quantity,
        discountAmount: offer.amount_of_discount,
        isPercentage: offer.is_percentage === 1 ? true : false,
      },
      message: "Successfully applied offer for current item",
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
  offerForItemBuyNow,
};
