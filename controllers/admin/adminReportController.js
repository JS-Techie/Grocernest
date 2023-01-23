const db = require("../../models");
const { sequelize } = require("../../models");

const fetchCustomerReport = async (req, res) => {
  console.log("coming");
  let data = req.body;

  // if customer number is available
  if (data.cust_id || data.cust_id !== "") {
    const [customer, metadata] = await sequelize.query(
      `select * from t_customer tc where tc.id = "${data.cust_id}"`
    );
    if (customer.length == 0) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "No customer is available in this customer number.",
      });
    }

    let date_field_query_add_on = "";
    if (data.start_date && data.end_date) {
      date_field_query_add_on = ` and created_at BETWEEN "${data.start_date}" and "${data.end_date}"`;
    }

    const getCustomerPurchaseData = async () => {
      return Promise.all(
        customer.map(async (current_customer) => {
          const [purchase_history, metadata2] = await sequelize.query(
            `
              select * from t_invoice where cust_id = "${data.cust_id}"
              ` + date_field_query_add_on
          );
          let cust_obj = {
            customer_info: customer[0],
            customer_purchase_count: purchase_history.length,
            customer_purchase_report: purchase_history,
          };
          return cust_obj;
        })
      );
    };

    const cust_purchase_history = await getCustomerPurchaseData();

    return res.status(200).send({
      success: true,
      data: cust_purchase_history,
      message: "Successfully fetched customer purchase history",
    });
  } else {
    //if customer number is not available
  }
};

module.exports = {
  fetchCustomerReport,
};
