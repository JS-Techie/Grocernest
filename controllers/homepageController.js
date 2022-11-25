const { sequelize } = require("../models");
const { Op } = require("sequelize");
const uniq = require("uniqid");

const db = require("../models");

const Banner = db.BannerModel;
const FeaturedBrands = db.FeaturedBrandsModel;
const WishlistItems = db.WishlistItemsModel;
const Offers = db.OffersModel;
const Item = db.ItemModel;
const FeaturedCategory = db.FeaturedCategoryModel;
const Customer = db.CustomerModel;
const Demand = db.DemandModel;
const Notify = db.NotifyModel;

const { uploadImageToS3 } = require("../services/s3Service");

const { findCustomerNumber } = require("../middleware/customerNumber");

const getBestSellers = async (req, res, next) => {
  //get current user if exists

  console.log("Inside best seller function");
  let currentUser = null;
  currentUser = await findCustomerNumber(req, res, next);

  try {
    const [bestsellers, metadata] =
      await sequelize.query(`select distinct t_item.id,count(*), t_item.name,t_item.brand_id,t_item.UOM ,t_item.is_grocernest,t_item.category_id ,t_item.sub_category_id ,
      t_item.image ,t_item.description ,t_item.available_for_ecomm ,t_batch.batch_no ,
      t_batch.location_id ,t_batch.MRP ,t_batch.discount ,t_batch.cost_price ,t_batch.mfg_date ,t_batch.sale_price ,
      t_batch.created_at,t_lkp_color.color_name, t_lkp_brand.brand_name, t_lkp_category.group_name, t_batch.mark_selected,t_batch.id as "batch_id"
      from ((((((t_order_items
      inner join t_item on t_item.id = t_order_items.item_id)
            inner join t_batch on t_batch.item_id = t_item.id )
            inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
            inner join t_lkp_category on t_lkp_category.id = t_item.category_id)
            inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
            inner join t_inventory on t_inventory.item_id = t_item.id)
            where t_inventory.location_id = 4 and t_inventory.balance_type = 1 and t_lkp_category.available_for_ecomm = 1 and t_item.available_for_ecomm = 1 and t_batch.mark_selected = 1
            group by t_order_items.item_id order by count(*) asc`);

    if (bestsellers.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no bestsellers to show right now",
      });
    }

    const promises = bestsellers.map(async (current) => {
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
        isGrocery: current.is_grocernest === 1 ? true : false,
      };
    });

    const responseArray = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found all the best sellers",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching the bestselling items, rest assured we are working on it",
      devMessage: "Please check data field for more details",
    });
  }
};

const allBigBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      where: { size: "b" },
    });

    if (banners.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no available banners to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: banners,
      message: "Found all big banners successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error details",
    });
  }
};

const allSmallBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      where: { size: "s" },
    });

    if (banners.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no available banners to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: banners,
      message: "Found all small banners successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error details",
    });
  }
};

const featuredBrands = async (req, res, next) => {
  try {
    const brands = await FeaturedBrands.findAll({});
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
      devMessage: "Please check data field for the error details",
    });
  }
};

const featuredCategories = async (req, res, next) => {
  try {
    const categories = await FeaturedCategory.findAll({});
    if (categories.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no featured brands to show right now",
      });
    }

    return res.status(200).send({
      success: true,
      data: categories,
      message: "Found all featured brands successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error details",
    });
  }
};

const createDemand = async (req, res, next) => {
  const { cust_no } = req;
  const { title, desc, base64, extension } = req.body;
  try {
    const currentCustomer = await Customer.findOne({ where: { cust_no } });

    if (!currentCustomer) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested user does not exist",
        devMessage: "User ID entered does not exist",
      });
    }
    let url = "";
    if (base64) {
      const key = `customer/demand/${cust_no}/${uniq()}.${extension}`;
      url = await uploadImageToS3(base64, key);
    }

    const newDemand = await Demand.create({
      cust_no,
      title,
      desc,
      url,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newDemand,
      message: "Successfully submitted your request to Grocernest",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error details",
    });
  }
};

const notify = async (req, res, next) => {
  const { cust_no } = req;
  const { id } = req.body;
  try {
    const item = await Item.findOne({ where: { id } });

    if (!item) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested item not found",
      });
    }

    const existingNotify = await Notify.findOne({
      where: { cust_no, item_id: id },
    });

    if (existingNotify) {
      return res.status(201).send({
        success: true,
        data: [],
        message: "You will be notified once this item is back in stock",
      });
    }
    const newNotify = await Notify.create({
      cust_no,
      item_id: id,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: newNotify,
      message: "You will be notified once this item is back in stock",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  getBestSellers,
  allBigBanners,
  allSmallBanners,
  featuredBrands,
  featuredCategories,
  createDemand,
  notify,
};
