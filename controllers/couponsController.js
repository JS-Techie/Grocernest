const { sequelize } = require("../models");

const db = require("../models");

const Coupons = db.CouponsModel;
const Cart = db.CartModel;
const Item = db.ItemModel;

const getAllAvailableCoupons = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;
  console.log(currentUser);

  const { itemID, total } = req.body;

  //Need to add total

  if (!total) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter total",
    });
  }

  let itemsInCart = [];

  if (!itemID) {
    itemsInCart = await Cart.findAll({
      where: { cust_no: currentUser },
    });
  }

  try {
    if (itemsInCart.length == 0) {
      const currentItem = await Item.findOne({
        where: { id: itemID },
      });

      if (!currentItem) {
        return res.status(404).send({
          success: false,
          data: null,
          message: "Item not found",
        });
      }

      const [coupons, metadata] = await sequelize.query(
        `select t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description
        from ecomm.t_coupons where t_coupons.item_id = ${currentItem.id} OR t_coupons.cat_id = ${currentItem.category_id} OR t_coupons.sub_cat_id = ${currentItem.sub_category_id} or t_coupons.brand_id = ${currentItem.brand_id}
       or t_coupons.assigned_user = "${currentUser}"`
      );

      if (coupons.length === 0) {
        return res.status(200).send({
          success: true,
          data: [],
          message: "No applicable coupons found",
        });
      }

      const promises = await coupons.map(async (current) => {
        return {
          couponCode: current.code,
          amount: current.is_percentage
            ? current.amount_of_discount + " %"
            : current.amount_of_discount,
          description: current.description,
        };
      });

      const resolved = await Promise.all(promises);

      return res.status(200).send({
        success: true,
        data: resolved,
        message: "Found all applicable coupons",
      });
    }

    const promiseArray = itemsInCart.map(async (current) => {
      const currentItem = await Item.findOne({
        where: { id: current.item_id },
      });

      const [coupons, metadata] =
        await sequelize.query(`select t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description
        from ecomm.t_coupons
        where t_coupons.item_id = ${currentItem.id} OR t_coupons.cat_id = ${currentItem.category_id} OR t_coupons.sub_cat_id = ${currentItem.sub_category_id} or t_coupons.brand_id = ${currentItem.brand_id} 
        or t_coupons.assigned_user = "${currentUser}"`);

      const innerPromise = coupons.map((currentCoupon) => {
        return {
          couponCode: currentCoupon.code,
          amount: currentCoupon.amount_of_discount,
          description: currentCoupon.description,
        };
      });

      return await Promise.all(innerPromise);
    });

    const resolved = await Promise.all(promiseArray);
    const responseArray = resolved.flat(1);

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "Found all coupons applicable",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching coupons, please check data field for more details",
    });
  }
};

const validateCoupon = async (req, res, next) => {
  //get current user from jwt
  const currentUser = req.cust_no;

  const { total, couponCode } = req.body;

  if (!total) {
    return res.send("Please pass in the total");
  }
  try {
    const couponExists = await Coupons.findOne({
      where: { code: couponCode },
    });

    if (!couponExists) {
      return res.status(404).send({
        success: false,
        data: null,
        message:
          "This coupon code doesnt exist, please enter correct coupon code",
      });
    }

    const updateCoupon = await Coupons.update(
      {
        usage: couponExists.usage + 1,
      },
      { where: { code: couponCode, } }
    );


    console.log(updateCoupon)

    if (couponExists.is_percentage === 1) {
      return res.status(200).send({
        success: true,
        data: {
          newTotal: total - (couponExists.amount_of_discount / 100) * total,
          couponUpdated: updateCoupon ? "Yes" : "No",
        },
        message: "Coupon successfully applied",
      });
    }

    return res.status(400).send({
      success: true,
      data: {
        newTotal: total - couponExists.amount_of_discount,
        couponUpdated: updateCoupon ? "Yes" : "No",
      },
      message: "Coupon successfully applied",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while applying coupon, please check data field for more details",
    });
  }
};

module.exports = {
  getAllAvailableCoupons,
  validateCoupon,
};
