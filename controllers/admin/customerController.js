const { sequelize } = require("../../models");
const Sequelize = require("sequelize");
const db = require("../../models");
const Op = Sequelize.Op;
const Customer = db.CustomerModel;

const getCustomerList = async (req, res, next) => {
  // console.log("getCustomerList");

  let search_term = req.params.phno ? req.params.phno : "";

  try {
    const [resData, metadata_2] = await sequelize.query(
      `
    SELECT t_customer.cust_no, t_customer.cust_name, t_customer.email, t_customer.contact_no, t_wallet.balance
  FROM t_customer
  INNER JOIN t_wallet ON t_customer.cust_no = t_wallet.cust_no
  WHERE t_customer.active_ind = 'Y'
  AND t_customer.contact_no LIKE '%` +
        search_term +
        `%'`
    );

    return res.status(201).json({
      success: true,
      data: resData,
      message: "Successfully fetched all Customers",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: error.message,
      message: "Error while fetching Customers",
    });
  }
};

module.exports = {
  getCustomerList,
};
