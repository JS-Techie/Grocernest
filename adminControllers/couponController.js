const cc = require("coupon-code");

const db = require("../models");

const Coupons = db.CouponsModel;
const Category = db.LkpCategoryModel;
const Subcategory = db.LkpSubCategoryModel;
const Item = db.ItemModel;
const Brand = db.LkpBrandModel;

const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupons.findAll();

    if (coupons.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "No coupons found",
      });
    }

    const promises = coupons.map(async (current) => {
      const item = await Item.findOne({
        where: { id: current.item_id },
      });

      const category = await Category.findOne({
        where: { id: current.cat_id },
      });

      const subcategory = await Subcategory.findOne({
        where: { id: current.sub_cat_id },
      });

      const brand = await Brand.findOne({
        where: { id: current.brand_id },
      });

      return {
        couponID: current.id,
        couponCode: current.code,
        amount: current.amount_of_discount,
        isPercentage: current.is_percentage === 1 ? true : false,
        categoryID: current.cat_id ? current.cat_id : "",
        categoryName: category ? category.group_name : "",
        subcategoryID: current.sub_cat_id ? current.sub_cat_id : "",
        subcategoryName: subcategory ? subcategory.sub_cat_name : "",
        itemID: current.item_id ? current.item_id : "",
        itemName: item ? item.name : "",
        itemCode: item ? item.item_cd : "",
        brandID: current.brand_id ? current.brand_id : "",
        brandName: brand ? brand.brand_name : "",
        minPurchase: current.min_purchase,
        maxPurchase: current.max_purchase,
        description: current.description,
        assignedTo: current.assigned_user ? current.assigned_user : "",
        expiryDate: current.expiry_date ? current.expiry_date : "",
        numberOfTimesUsed: current.usage,
        createdBy: current.created_by,
        couponType: current.type ? current.type : "",
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all coupons",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const getCouponById = async (req, res, next) => {
  const couponID = req.params.id;

  try {
    const coupon = await Coupons.findOne({
      where: { id: couponID },
    });

    if (!coupon) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No coupon found for entered ID",
      });
    }

    const item = await Item.findOne({
      where: { id: coupon.item_id },
    });

    const category = await Category.findOne({
      where: { id: coupon.cat_id },
    });

    const subcategory = await Subcategory.findOne({
      where: { id: coupon.sub_cat_id },
    });

    const brand = await Brand.findOne({
      where: { id: coupon.brand_id },
    });

    return res.status(200).send({
      success: true,
      data: {
        couponID: coupon.id,
        couponCode: coupon.code,
        amount: coupon.amount_of_discount,
        isPercentage: coupon.is_percentage === 1 ? true : false,
        categoryID: coupon.cat_id ? coupon.cat_id : "",
        categoryName: category ? category.group_name : "",
        subcategoryID: coupon.sub_cat_id ? coupon.sub_cat_id : "",
        subcategoryName: subcategory ? subcategory.sub_cat_name : "",
        itemID: coupon.item_id ? coupon.item_id : "",
        itemName: item ? item.name : "",
        itemCode: item ? item.item_cd : "",
        brandID: coupon.brand_id ? coupon.brand_id : "",
        brandName: brand ? brand.brand_name : "",
        minPurchase: coupon.min_purchase,
        maxPurchase: coupon.max_purchase,
        description: coupon.description,
        assignedTo: coupon.assigned_user ? coupon.assigned_user : "",
        expiryDate: coupon.expiry_date ? coupon.expiry_date : "",
        numberOfTimesUsed: coupon.usage,
        createdBy: coupon.created_by,
        couponType: coupon.type,
      },
      message: "Found requested coupon",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const createCoupon = async (req, res, next) => {
  const {
    type,
    code,
    amount_of_discount,
    is_percentage,
    cat_id,
    sub_cat_id,
    item_id,
    brand_id,
    description,
    min_purchase,
    max_purchase,
    expiry_date,
    assigned_user,
  } = req.body;

  if (cat_id && sub_cat_id && item_id && brand_id && assigned_user) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter at least one field",
    });
  }

  if (amount_of_discount === 0) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter an amount, it cannot be zero",
    });
  }

  try {
    const newCoupon = await Coupons.create({
      code: code ? code : cc.generate(),
      amount_of_discount,
      is_percentage: is_percentage === true ? 1 : null,
      cat_id,
      sub_cat_id,
      item_id,
      brand_id,
      description,
      min_purchase,
      max_purchase,
      expiry_date,
      assigned_user,
      created_by: 1,
      usage: 0,
      type,
    });

    return res.status(201).send({
      success: true,
      data: newCoupon,
      message: "New coupon successfully created",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const updateCoupon = async (req, res, next) => {
  const couponID = req.params.id;

  try {
    const exists = await Coupons.findOne({
      where: { id: couponID },
    });

    if (!exists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No coupons found with entered ID",
      });
    }

    let {
      code,
      amount_of_discount,
      is_percentage,
      cat_id,
      sub_cat_id,
      item_id,
      brand_id,
      description,
      min_purchase,
      max_purchase,
      expiry_date,
      assigned_user,
    } = req.body;

    if (is_percentage) {
      if (is_percentage === true) {
        is_percentage = 1;
      }
    }

    const updatedCoupon = await Coupons.update(
      {
        code: code ? code : "",
        amount_of_discount: amount_of_discount ? amount_of_discount : null,
        is_percentage: is_percentage !== null ? is_percentage : null,
        cat_id: cat_id ? cat_id : null,
        sub_cat_id: sub_cat_id ? sub_cat_id : null,
        item_id: item_id ? item_id : null,
        brand_id: brand_id ? brand_id : null,
        description: description ? description : "",
        min_purchase: min_purchase ? min_purchase : null,
        max_purchase: max_purchase ? max_purchase : null,
        expiry_date: expiry_date ? expiry_date : null,
        assigned_user: assigned_user ? assigned_user : "",
      },
      {
        where: { id: couponID },
      }
    );

    return res.status(200).send({
      success: true,
      data: {
        numberOfUpdatedRows: updatedCoupon,
      },
      message: "Successfully updated coupon",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const deleteCoupon = async (req, res, next) => {
  const couponID = req.params.id;

  try {
    const exists = await Coupons.findOne({
      where: { id: couponID },
    });

    if (!exists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Coupon with requested ID not found",
      });
    }

    const deletedCoupon = await Coupons.destroy({
      where: { id: couponID },
    });

    return res.status(200).send({
      success: false,
      data: {
        numberOfUpdatedRows: deletedCoupon,
      },
      message: "Requested coupon deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
