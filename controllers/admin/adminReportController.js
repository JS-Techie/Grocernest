const db = require("../../models");
const { sequelize } = require("../../models");

const fetchCustomerReport = async (req, res) => {
  console.log("coming");
  let data = req.body;

  try {
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
        date_field_query_add_on = ` and created_at >= "${data.start_date}" and created_at <= "${data.end_date}"`;
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
      let date_field_query_add_on = "";
      if (data.start_date && data.end_date) {
        date_field_query_add_on = ` and created_at >= "${data.start_date}" and created_at <= "${data.end_date}"`;
      }

      let date_field_query_add_on_2 = "";
      if (data.start_date && data.end_date) {
        date_field_query_add_on_2 = ` and t_invoice.created_at >= "${data.start_date}" and t_invoice.created_at <= "${data.end_date}"`;
      }

      const [customer_purchase_count_report, metadata] = await sequelize.query(
        `      select t_customer.cust_no,t_customer.id, count(t_invoice.id) as customer_purchase_count from t_customer
        inner join t_invoice on t_invoice.cust_id = t_customer.id ` +
          date_field_query_add_on_2 +
          ` group by t_customer.cust_no 
          order by customer_purchase_count desc`
      );

      let customer_purchase_report = [];
      for (let i = 0; i < customer_purchase_count_report.length; i++) {
        let customer_obj = {};
        const [customer_info, metadata] = await sequelize.query(
          `
       select id,cust_no,cust_name,email,contact_no from t_customer where cust_no="${customer_purchase_count_report[i].cust_no}"
        `
        );

        const [cust_purchase_history, metadata2] = await sequelize.query(
          `select id, cust_id, invoice_no, teller_name, invoice_type, total_amount from t_invoice where cust_id = "${customer_purchase_count_report[i].id}"
          ` + date_field_query_add_on
        );
        customer_obj = {
          customer_info: customer_info[0],
          customer_purchase_count:
            customer_purchase_count_report[i].customer_purchase_count,
          customer_purchase_report: cust_purchase_history,
        };
        customer_purchase_report.push(customer_obj);
      }

      //if customer number is not available
      return res.status(200).send({
        success: true,
        data: customer_purchase_report,
        message: "successfully fetched multiple customer report data.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message:
        "Something went wrong while fetching multiple customer report data.",
    });
  }
};

module.exports = {
  fetchCustomerReport,
};
