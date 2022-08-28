const { sequelize } = require("../models");
const moment = require("moment");

const db = require("../models");
// const { DATE } = require("sequelize");
// const { DATEONLY } = require("sequelize");

const Coupons = db.CouponsModel;
const Cart = db.CartModel;
const Item = db.ItemModel;

const getAllAvailableCoupons = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;
  console.log(currentUser);

  const { itemID, total } = req.body;

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

  console.log("Items in cart ====> ", itemsInCart);

  try {
    if (itemsInCart.length === 0) {
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
        `select t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description, t_coupons.expiry_date, t_coupons.created_at
        from grocernest_pre_prod.t_coupons where t_coupons.item_id = ${currentItem.id} OR t_coupons.cat_id = ${currentItem.category_id} OR t_coupons.sub_cat_id = ${currentItem.sub_category_id} or t_coupons.brand_id = ${currentItem.brand_id}
       or t_coupons.assigned_user = "${currentUser}" or (${total} <= t_coupons.max_purchase and ${total} >= t_coupons.min_purchase )`
      );

      if (coupons.length === 0) {
        return res.status(200).send({
          success: true,
          data: [],
          message: "No applicable coupons found",
        });
      }

      console.log(coupons);

      const promises = await coupons.map(async (current) => {
        if (current.expiry_date !== null) {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (new Date(current.expiry_date) >= yesterday) {
            return {
              couponCode: current.code,
              amount: current.is_percentage
                ? current.amount_of_discount + " %"
                : current.amount_of_discount,
              description: current.description,
            };
          }
        } else {
          return {
            couponCode: current.code,
            amount: current.is_percentage
              ? current.amount_of_discount + " %"
              : current.amount_of_discount,
            description: current.description,
          };
        }
      });

      const resolved = await Promise.all(promises);

      const resolvedWithoutUndefined = await resolved.filter((current) => {
        return current !== undefined;
      });
      const response = [
        ...new Map(
          resolvedWithoutUndefined.map((item) => [item["couponCode"], item])
        ).values(),
      ];

      return res.status(200).send({
        success: true,
        data: response,
        message: "Found all applicable coupons",
      });
    }

    const promiseArray = itemsInCart.map(async (current) => {
      const currentItem = await Item.findOne({
        where: { id: current.item_id },
      });

      const [coupons, metadata] =
        await sequelize.query(`select t_coupons.code, t_coupons.amount_of_discount ,t_coupons.is_percentage ,t_coupons.description,t_coupons.expiry_date
        from grocernest_pre_prod.t_coupons
        where t_coupons.item_id = ${currentItem.id} OR t_coupons.cat_id = ${currentItem.category_id} OR t_coupons.sub_cat_id = ${currentItem.sub_category_id} or t_coupons.brand_id = ${currentItem.brand_id} 
        or t_coupons.assigned_user = "${currentUser}" or (${total} <= t_coupons.max_purchase and ${total} >= t_coupons.min_purchase )`);

      const innerPromise = coupons.map((current) => {
        if (current.expiry_date !== null) {
          // console.log("current coupon code ====>", current.code);
          // console.log("Expiry date for current coupon===>",new Date(current.expiry_date))
          // console.log("Current date====>", new Date());

          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (new Date(current.expiry_date) >= yesterday) {
            return {
              couponCode: current.code,
              amount: current.is_percentage
                ? current.amount_of_discount + " %"
                : current.amount_of_discount,
              description: current.description,
            };
          }
        } else {
          // console.log(new Date(current.expiry_date));
          // console.log(Date.now());
          // console.log(new Date());
          return {
            couponCode: current.code,
            amount: current.is_percentage
              ? current.amount_of_discount + " %"
              : current.amount_of_discount,
            description: current.description,
          };
        }
      });

      return await Promise.all(innerPromise);
    });

    const resolved = await Promise.all(promiseArray);
    console.log(resolved);

    const response = resolved.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    const flattenedArray = response.flat(1);

    const resolvedWithoutUndefined = flattenedArray.filter((current) => {
      return current !== undefined;
    });
    const responseArray = [
      ...new Map(
        resolvedWithoutUndefined.map((item) => [item["couponCode"], item])
      ).values(),
    ];

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
      { where: { code: couponCode } }
    );

    console.log(updateCoupon);

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

    return res.status(200).send({
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
