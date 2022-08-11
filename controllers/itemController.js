const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { sequelize } = require("../models");
const db = require("../models");

const WishlistItems = db.WishlistItemsModel;
const Offers = db.OffersModel;
const Item = db.ItemModel;

const { findCustomerNumber } = require("../middleware/customerNumber");

const getItemsInCategory = async (req, res, next) => {
  //get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  //Get category id from the request
  const category = req.params.categoryId;
  try {
    const [itemsInACategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id ,t_item.sub_category_id ,
      t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name
      from (((((ecomm.t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_lkp_category.id = ${category} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 order by created_at desc;
    `);

    if (itemsInACategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested category",
      });
    }

    const promises = await itemsInACategory.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          [Op.or]: [{ item_id_1: current.id }, { item_id: current.id }],
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

      return {
        itemName: current.name,
        itemID: current.id,
        UOM: current.UOM,
        categoryName: current.group_name,
        categoryID: current.category_id,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
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
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found the items belonging to requested category",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occured while fetching items belonging to requested category",
    });
  }
};

const getItemsInSubcategory = async (req, res, next) => {
  //Get category and subcategory id from params
  const category = req.params.categoryId;
  const subcategory = req.params.subcategoryId;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    const [ItemsInASubcategory, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id ,t_item.sub_category_id ,
    t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name ,t_lkp_sub_category.sub_cat_name, t_lkp_category.group_name
    from ((((((ecomm.t_item
          inner join t_batch on t_batch.item_id = t_item.id )
          inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
          inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
          inner join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
          inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
          inner join t_inventory on t_inventory.item_id = t_item.id)
           where t_lkp_category.id = ${category} and t_lkp_sub_category.id = ${subcategory} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_lkp_sub_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 order by t_batch.created_at desc;`);

    if (ItemsInASubcategory.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Could not find items in requested sub-category",
      });
    }

    const promises = ItemsInASubcategory.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          [Op.or]: [{ item_id_1: current.id }, { item_id: current.id }],
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
      return {
        itemName: current.name,
        itemID: current.id,
        categoryID: current.category_id,
        categoryName: current.group_name,
        subcategoryID: current.sub_category_id,
        subcategoryName: current.sub_cat_name,
        UOM: current.UOM,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
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
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found requested items in subcategory",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Error occurred while fetching requested items in sub category",
    });
  }
};

const getItemsBySearchTerm = async (req, res, next) => {
  //get the search term, find if anything from category or subcategory or item or brand name matches with the search term
  const searchTerm = req.params.searchTerm;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    const [results, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
    ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
    t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
    t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name
    from ((((((ecomm.t_item
          inner join t_batch on t_batch.item_id = t_item.id )
          inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
          inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
          inner join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
          inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
          inner join t_inventory on t_inventory.item_id = t_item.id)
          where(t_item.name like "%${searchTerm}%" or t_lkp_category.group_name like "%${searchTerm}%" or t_lkp_brand.brand_name like "%${searchTerm}%" or t_lkp_sub_category.sub_cat_name like "%${searchTerm}%")  and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_lkp_sub_category.available_for_ecomm = 1 order by t_batch.created_at desc`);

    if (results.length === 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "No items found based on search term",
      });
    }

    const promises = results.map(async (current) => {
      let itemInWishlist;
      if (currentUser) {
        itemInWishlist = await WishlistItems.findOne({
          where: { cust_no: currentUser, item_id: current.id },
        });
      }

      const offer = await Offers.findOne({
        where: {
          is_active: 1,
          [Op.or]: [{ item_id_1: current.id }, { item_id: current.id }],
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
      return {
        itemName: current.name,
        itemID: current.id,
        categoryID: current.category_id,
        categoryName: current.group_name,
        subcategoryID: current.sub_category_id,
        subcategoryName: current.sub_cat_name,
        UOM: current.UOM,
        image: current.image,
        description: current.description,
        MRP: current.MRP,
        discount: current.discount,
        sale_price: current.sale_price,
        mfg_date: current.mfg_date,
        color: current.color_name,
        brand: current.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
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
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
      };
    });

    const resolved = await Promise.all(promises);
    const responseArray = [
      ...new Map(resolved.map((item) => [item["itemID"], item])).values(),
    ];

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Successfully found items relating to search term",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occurred while searching for items, please check data field for more details",
    });
  }
};

const getItemById = async (req, res, next) => {
  //Get the itemId from the params
  const currentItemId = req.params.itemId;

  //Get current user if exists
  let currentUser = null;

  currentUser = await findCustomerNumber(req, res, next);

  console.log(currentUser);

  try {
    //Find all the details of the item pertaining to current item id
    const [itemResults, metadata] =
      await sequelize.query(`select distinct t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id, t_lkp_category.group_name,t_item.sub_category_id , t_lkp_sub_category.sub_cat_name 
      ,t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.expiry_date,
      t_batch.created_at,t_lkp_color.color_name,t_batch.quantity, t_lkp_brand.brand_name
      from ((((((ecomm.t_item
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            INNER join t_lkp_sub_category on t_lkp_sub_category.id = t_item.sub_category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
             where t_item.id = ${currentItemId} and t_inventory.location_id = 4 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 order by t_batch.created_at;`);

    if (itemResults.length == 0) {
      return res.status(404).send({
        success: false,
        data: null,
        message: "Details for requested item not found",
      });
    }
    const item = await itemResults[0];

    let availableQuantity = 0;
    itemResults.map((current) => {
      availableQuantity += current.quantity;
    });

    let itemInWishlist;
    if (currentUser) {
      itemInWishlist = await WishlistItems.findOne({
        where: { cust_no: currentUser, item_id: item.id },
      });
    }

    const offer = await Offers.findOne({
      where: {
        is_active: 1,
        [Op.or]: [{ item_id_1: item.id }, { item_id: item.id }],
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

    return res.status(200).send({
      success: true,
      data: {
        itemName: item.name,
        itemID: item.id,
        quantity: availableQuantity,
        UOM: item.UOM,
        categoryName: item.group_name,
        categoryID: item.category_id,
        subcategoryName: item.sub_cat_name,
        subcategoryID: item.sub_category_id,
        image: item.image,
        description: item.description,
        MRP: item.MRP,
        discount: item.discount,
        sale_price: item.sale_price,
        mfg_date: item.mfg_date,
        exp_date: item.expiry_date,
        color: item.color_name,
        brand: item.brand_name,
        inWishlist: currentUser ? (itemInWishlist ? true : false) : "",
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
        createdBy: offer ? (offer.created_by ? offer.created_by : "") : "",
      },
      message: "Details for requested item found",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Error occurred while trying to fetch item details, please check data field for more details",
    });
  }
};

module.exports = {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
  getItemById,
};
