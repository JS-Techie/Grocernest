const cc = require("coupon-code");

const db = require("../models");

const Coupons = db.CouponsModel;

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
      return {
        couponID: current.id,
        couponCode: current.code,
        amount: current.amount_of_discount,
        isPercentage: current.is_percentage === 1 ? "Yes" : "No",
        categoryID: current.cat_id ? current.cat_id : "",
        subcategoryID: current.sub_cat_id ? current.sub_cat_id : "",
        itemID: current.item_id ? current.item_id : "",
        brandID: current.brand_id ? current.brand_id : "",
        minPurchase: current.min_purchase ? current.min_purchase : "",
        maxPurchase: current.max_purchase ? current.max_purchase : "",
        description: current.description,
        assignedTo: current.assigned_user ? current.assigned_user : "",
        expiryDate: current.expiry_date ? current.expiry_date : "",
        numberOfTimesUsed: current.usage,
        createdBy: current.created_by,
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

    return res.status(200).send({
      success: true,
      data: {
        couponID: coupon.id,
        couponCode: coupon.code,
        amount: coupon.amount_of_discount,
        isPercentage: coupon.is_percentage === 1 ? "Yes" : "No",
        categoryID: coupon.cat_id ? coupon.cat_id : "",
        subcategoryID: coupon.sub_cat_id ? coupon.sub_cat_id : "",
        itemID: coupon.item_id ? coupon.item_id : "",
        brandID: coupon.brand_id ? coupon.brand_id : "",
        minPurchase: coupon.min_purchase ? coupon.min_purchase : "",
        maxPurchase: coupon.max_purchase ? coupon.max_purchase : "",
        description: coupon.description,
        assignedTo: coupon.assigned_user ? coupon.assigned_user : "",
        expiryDate: coupon.expiry_date ? coupon.expiry_date : "",
        numberOfTimesUsed: coupon.usage,
        createdBy: coupon.created_by,
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

  try {
    const newCoupon = await Coupons.create({
      code: code ? code : cc.generate(),
      amount_of_discount,
      is_percentage : is_percentage ? 1 : null,
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

    const {
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

    const updatedCoupon = await Coupons.update(
      {
        amount_of_discount: amount_of_discount
          ? amount_of_discount
          : exists.amount_of_discount,
        is_percentage: is_percentage ? is_percentage : exists.is_percentage,
        cat_id: cat_id ? cat_id : exists.cat_id,
        sub_cat_id: sub_cat_id ? sub_cat_id : exists.sub_cat_id,
        item_id: item_id ? item_id : exists.item_id,
        brand_id: brand_id ? brand_id : exists.brand_id,
        description: description ? description : exists.description,
        min_purchase: min_purchase ? min_purchase : exists.min_purchase,
        max_purchase: max_purchase ? max_purchase : exists.max_purchase,
        expiry_date: expiry_date ? expiry_date : exists.expiry_date,
        assigned_user: assigned_user ? assigned_user : exists.assigned_user,
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
