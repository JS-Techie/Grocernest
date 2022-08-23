const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");

const Wishlist = db.WishlistItemsModel;
const Batch = db.BatchModel;
const Item = db.ItemModel;
const Inventory = db.InventoryModel;
const Offers = db.OffersModel;

const createWishlist = async (req, res, next) => {
  //get current user from jwt
  // const currentUser = req.cust_no;
};

const getWishlist = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  try {
    const [wishlist, metadata] =
      await sequelize.query(`select t_wishlist_items.item_id,t_item.name, t_item.image, t_item.category_id, t_item.sub_category_id,t_item.description, t_item.UOM,
      t_batch.MRP,t_batch.sale_price, t_batch.discount,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name,
      t_lkp_sub_category.sub_cat_name, t_batch.mfg_date
      from ((((((t_wishlist_items
        inner join t_item on t_item.id = t_wishlist_items.item_id)
      inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
      INNER join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
      inner join t_batch on t_batch.item_id = t_wishlist_items.item_id )
      inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
      inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
      where t_wishlist_items.cust_no = "${currentUser}"`);

    if (wishlist.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No wishlist found for current user",
      });
    }

    const promises = wishlist.map(async (current) => {
      const oldestBatch = await Batch.findOne({
        where: { item_id: current.item_id, mark_selected: 1 },
      });

      let currentItem = null;
      if (oldestBatch) {
        currentItem = await Inventory.findOne({
          where: {
            item_id: current.item_id,
            batch_id: oldestBatch.id,
            location_id: 4,
            balance_type: 1,
          },
        });

        const offer = await Offers.findOne({
          where: {
            is_active: 1,
            [Op.or]: [{ item_id_1: current.item_id }, { item_id: current.item_id }],
          },
        });

        let itemIDOfOfferItem;
        let offerItem;
        if (offer) {
          if (offer.item_id) {
            itemIDOfOfferItem = offer.item_id;
          } else {
            itemIDOfOfferItem = offer.item_id_2;
          }
          offerItem = await Item.findOne({
            where: { id: itemIDOfOfferItem },
          });
        }

        if (oldestBatch && currentItem) {
          return {
            itemID: current.item_id,
            itemName: current.name,
            UOM: current.UOM,
            availableQuantity: currentItem.quantity,
            categoryName: current.group_name,
            categoryID: current.category_id,
            image: current.image,
            description: current.description,
            MRP: oldestBatch.MRP,
            discount: oldestBatch.discount,
            sale_price: oldestBatch.sale_price,
            mfg_date: oldestBatch.mfg_date,
            color: current.color_name,
            brand: current.brand_name,
            inWishlist: true,
            isOffer: offer ? true : false,
            offerType: offer ? offer.type : "",
            itemIDOfOfferItem,
            XQuantity: offer
              ? offer.item_1_quantity
                ? offer.item_1_quantity
                : ""
              : "",
            YQuantity: offer
              ? offer.item_2_quantity
                ? offer.item_2_quantity
                : ""
              : "",
            YItemName: offerItem ? offerItem.name : "",
            amountOfDiscount: offer
              ? offer.amount_of_discount
                ? offer.amount_of_discount
                : ""
              : "",
            isPercentage: offer ? (offer.is_percentage ? true : false) : "",
          };
        }
      }
    });

    const resolved = await Promise.all(promises);
    const resolvedWithoutUndefined = await resolved.filter((current) => {
      return current !== undefined;
    });
    const responseArray = [
      ...new Map(
        resolvedWithoutUndefined.map((item) => [item["itemID"], item])
      ).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Wishlist successfully found for user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching wishlist for current user, please check data field for more details",
    });
  }
};

const addItemToWishlist = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  const itemToBeAdded = req.params.itemId;

  try {
    const wishlist = await Wishlist.findOne({
      where: { cust_no: currentUser, item_id: itemToBeAdded },
    });

    if (wishlist) {
      return res.status(400).send({
        success: false,
        data: {
          currentUser,
          itemID: wishlist.item_id,
        },
        message:
          "Item already in wishlist, please consider adding a different item",
      });
    }

    const itemExists = await Item.findOne({
      where: { id: itemToBeAdded },
    });

    if (!itemExists) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Item requested doesnt exist",
      });
    }

    const newItem = await Wishlist.create({
      cust_no: currentUser,
      item_id: itemToBeAdded,
      created_by: 2,
    });

    return res.status(201).send({
      success: true,
      data: {
        currentUser,
        itemID: newItem.item_id,
      },
      message: "Successfully added item to wishlist",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while adding item to wishlist, please see error message for more details",
    });
  }
};

const removeItemFromWishlist = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  const itemToBeRemoved = req.params.itemId;

  try {
    const wishlist = await Wishlist.findOne({
      where: { cust_no: currentUser, item_id: itemToBeRemoved },
    });

    if (!wishlist) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Item not in wishlist, cannot be removed",
      });
    }

    const numberOfRowsDeleted = await Wishlist.destroy({
      where: { cust_no: currentUser, item_id: itemToBeRemoved },
    });

    return res.status(200).send({
      success: true,
      data: numberOfRowsDeleted,
      message: "Item removed from wishlist successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while removing item, please check data field for more details",
    });
  }
};

const deleteWishlist = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  try {
    const wishlist = await Wishlist.findAll({
      where: { cust_no: currentUser },
    });

    if (wishlist.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No wishlist found for current user",
      });
    }

    const deletedWishlist = await Wishlist.destroy({
      where: { cust_no: currentUser },
    });

    return res.status(200).send({
      success: true,
      data: deletedWishlist,
      message: "Deleted wishlist for current user successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while deleting wishlist, please check data field for more details",
    });
  }
};

module.exports = {
  getWishlist,
  createWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  deleteWishlist,
};
