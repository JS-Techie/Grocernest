const cc = require("coupon-code");
const db = require("../../models");
const uniq = require("uniqid");
const { sequelize } = require("../../models");
const CouponToCustomer = db.CouponToCustomerModel;
const Customer = db.CustomerModel;
const CustomerToCouponMapping = db.CustomerToCouponMappingModel;

const {
  sendCouponToCustomer,
} = require("../../services/whatsapp/whatsappMessages");

const createCouponToCustomer = async (req, res, next) => {
  const {
    coupon_name,
    coupon_desc,
    amount_of_discount,
    duration,
    minPurchase,
    redeem_product_type,
  } = req.body;

  const { user_id } = req;

  try {
    if (
      coupon_name == "" ||
      amount_of_discount == "" ||
      amount_of_discount <= 0 ||
      duration == "" ||
      duration <= 0 ||
      minPurchase < 0 ||
      redeem_product_type === ""
    ) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter all mandatory field and put valid data",
      });
    }

    // string checking due
    if (amount_of_discount === 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Please enter an amount, it cannot be zero",
      });
    }

    // check that coupon code is available already or not
    const couponAvailable = await CouponToCustomer.findAll({
      where: {
        coupon_name,
      },
    });

    if (couponAvailable.length > 0) {
      return res.status(400).send({
        success: false,
        data: [],
        message: "Coupon code already exists! try with a different name.",
      });
    }

    // coupon code is not already taken, so proceed..
    let new_id = uniq();
    const newCoupon = await CouponToCustomer.create({
      id: new_id,
      coupon_name,
      coupon_desc,
      amount_of_discount,
      duration,
      created_by: user_id,
      min_purchase: minPurchase,
      redeem_product_type: redeem_product_type,
    });

    return res.status(201).send({
      success: true,
      data: newCoupon,
      message: "New coupon to customer successfully created",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const displayCouponToCustomer = async (req, res, next) => {
  try {
    const allCoupons = await CouponToCustomer.findAll({});

    // No check for empty coupons
    return res.status(200).send({
      success: true,
      data: allCoupons,
      message: "All coupon to customer fetched successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong.",
    });
  }
};

const updateCouponToCustomer = async (req, res, next) => {
  const { id, coupon_desc, amount_of_discount, duration } = req.body;
  const { user_id } = req;

  if (
    amount_of_discount <= 0 ||
    amount_of_discount == "" ||
    duration == "" ||
    duration <= 0
  ) {
    return res.status(400).send({
      success: false,
      data: [],
      message: "Please enter all mandatory field and put valid data",
    });
  }

  try {
    // No  check if ID exists
    const updatedCoupon = CouponToCustomer.update(
      {
        coupon_desc,
        amount_of_discount,
        duration,
        updated_at: new Date().getTime(),
        updated_by: user_id,
      },
      { where: { id } }
    );
    return res.status(200).send({
      success: true,
      data: updatedCoupon,
      message: "The coupon to customer edited successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong.",
    });
  }
};

const deleteCouponToCustomer = async (req, res, next) => {
  const { id } = req.body;

  try {
    // No check for ID
    const deleted = await CouponToCustomer.destroy({
      where: { id },
    });

    return res.status(200).send({
      success: true,
      data: deleted,
      message: "The coupon to customer deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong.",
    });
  }
};

const mapCouponToCustomer = async (req, res, next) => {
  const { cust_no, coupon_id, coupon_name } = req.body;
  const { user_id } = req;

  try {
    // check coupon exist or not
    let couponExist = await CouponToCustomer.findOne({
      where: {
        id: coupon_id,
        coupon_name: coupon_name,
      },
    });

    if (couponExist.length < 1) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "Coupon Name/Coupon ID does not exist.",
      });
    }

    // check customer exist or not
    let customerExist = await Customer.findAll({
      where: {
        cust_no,
      },
    });

    if (customerExist.length < 1) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "Customer/Customer ID does not exist.",
      });
    }
    let currentCustomer = customerExist[0];

    var expiry_timestamp = new Date();
    expiry_timestamp.setDate(
      expiry_timestamp.getDate() + parseInt(couponExist.duration)
    );

    // everything is valid, now create the map
    const mapCustomerToCouponData = CustomerToCouponMapping.create({
      cust_id: cust_no,
      coupon_id,
      coupon_name,
      assignment_date: new Date().getTime(),
      expiry_date: expiry_timestamp,
      created_by: user_id,
    });

    // coupon mapped, now send notification to whatsapp
    sendCouponToCustomer(
      currentCustomer.cust_name.split(" ")[0],
      coupon_name,
      "",
      couponExist.amount_of_discount.toString(),
      currentCustomer.contact_no.toString(),
      expiry_date
    );
    return res.status(200).send({
      success: true,
      data: mapCustomerToCouponData,
      message: "User mapped to the coupon successfully!",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong while mapping user to the coupon.",
    });
  }
};

const displayMappedCouponToCustomer = async (req, res, next) => {
  try {
    const [allCustomerToCouponMapping, metadata] = await sequelize.query(
      `select tccm.cust_id, tccm.coupon_id, tc.cust_name, tc.contact_no,
            tccm.coupon_name, tccm.assignment_date, tccm.expiry_date, tccm.coupon_used_date
            from t_customer_coupon_mapping tccm 
            left outer join t_customer tc on tc.cust_no = tccm.cust_id order by tccm.assignment_date DESC;`
    );

    // Empty check
    return res.status(200).send({
      success: true,
      data: allCustomerToCouponMapping,
      message: "All coupon to customer mapped data fetched successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong.",
    });
  }
};

const applicableCouponForACustomer = async (req, res, next) => {
  const { cust_no } = req.body;

  if (!cust_no) {
    return res.status(400).send({
      success: false,
      data: "",
      message: "Please provide cust_no",
    });
  }
  try {
    const [allApplicableCouponsForThisCustomer, metadata] =
      await sequelize.query(
        `select tccm.id as map_id, tccm.coupon_id, tccm.coupon_name, tctc.amount_of_discount, 
            tccm.assignment_date ,tccm.expiry_date,tctc.min_purchase,tctc.redeem_product_type
            from t_customer_coupon_mapping tccm 
            inner join t_coupon_to_customer tctc 
            where tccm.cust_id ="` +
          cust_no +
          `" 
            and tctc.coupon_name = tccm.coupon_name 
            and tccm.coupon_used_date is NULL
            and DATE(tccm.expiry_date) >= CURDATE() ORDER by tccm.expiry_date ASC;
        `
      );

    return res.status(200).send({
      success: true,
      data: allApplicableCouponsForThisCustomer,
      message: "All coupons for this customer fetched successfully",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong.",
    });
  }
};

const applyCoupon = async (req, res, next) => {
  const { map_id, cust_no } = req.body;

  try {
    if (!map_id || !cust_no) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "Please provide map_id and cust_no",
      });
    }

    let assigned_coupon = await CustomerToCouponMapping.findOne({
      where: {
        id: map_id,
        cust_id: cust_no,
      },
    });

    // check coupon is valid or not
    if (!assigned_coupon) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "No such coupons found.",
      });
    }

    // check this coupon used or not
    if (assigned_coupon.coupon_used_date) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "This coupon is already used!",
      });
    }

    let current_date = new Date();
    // now everything is fine, coupon can be applied
    const update_cust_coupon_map = await CustomerToCouponMapping.update(
      {
        coupon_used_date: current_date,
        updated_at: current_date,
      },
      {
        where: {
          id: map_id,
          cust_id: cust_no,
        },
      }
    );

    return res.status(200).send({
      success: true,
      data: "",
      message: "Coupon used successfully!",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong while using the coupon.",
    });
  }
};

module.exports = {
  createCouponToCustomer,
  displayCouponToCustomer,
  updateCouponToCustomer,
  deleteCouponToCustomer,

  mapCouponToCustomer,
  displayMappedCouponToCustomer,
  applicableCouponForACustomer,
  applyCoupon,
};
