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
        date_field_query_add_on = ` and created_at >= "${data.start_date}" and created_at < ADDDATE("${data.end_date}",1)`;
      }

      const getCustomerPurchaseData = async () => {
        return Promise.all(
          customer.map(async (current_customer) => {
            const [purchase_history, metadata2] = await sequelize.query(
              `
              select * from t_invoice where cust_id = "${data.cust_id}" and t_invoice.payment_conf_ind = "Y"
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
        date_field_query_add_on = ` and created_at >= "${data.start_date}" and created_at <  ADDDATE("${data.end_date}",1)`;
      }

      let date_field_query_add_on_2 = "";
      if (data.start_date && data.end_date) {
        date_field_query_add_on_2 = ` and t_invoice.created_at >= "${data.start_date}" and t_invoice.created_at <  ADDDATE("${data.end_date}",1)`;
      }

      const [customer_purchase_count_report, metadata] = await sequelize.query(
        `      select t_customer.cust_no,t_customer.id, count(t_invoice.id) as customer_purchase_count from t_customer
        inner join t_invoice on t_invoice.cust_id = t_customer.id ` +
        date_field_query_add_on_2 +
        ` and t_invoice.payment_conf_ind = "Y" group by t_customer.cust_no 
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




const fetchItemtoCustomerReport = async (req, res) => {

  const {
    item_id,
    start_date,
    end_date
  } = req.body

  if (!item_id || item_id === "" || !start_date || start_date === "" || !end_date || end_date === "") {
    return res.status(400).send({
      success: false,
      data: "",
      message: "No customer is available in this customer number.",
    });
  }


  try {

    const CustomerIDforDateQuery = ` 
    select cust_id, Date(created_at) as InvDate, count(*) as quantity  from t_invoice where id in 
    (select invoice_id from t_invoice_item_dtls where item_id = ${item_id} and created_at between "${start_date}" and "${end_date}") group by Date(created_at) 
    `

    const [CustomerIDforDateResult, metadata] = await sequelize.query(CustomerIDforDateQuery)

    if (CustomerIDforDateResult.length === 0) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "No customer is available corresponding this item.",
      })
    }

    // console.log("::::::::::::::::::::", CustomerIDforDateResult)
    const [itemName, metadata2] = await sequelize.query(`select * from t_item where id=${item_id}`)


    let responseArray = []

    for (i in CustomerIDforDateResult) {
      const eachCustomer = CustomerIDforDateResult[i]
      const [customerDetails, metadata1] = await sequelize.query(`select * from t_customer where id=${eachCustomer.cust_id}`)

      // console.log("((((((((((((((((((()))))))))))))))))))", customerDetails)

      const response = {
        itemName: itemName[0].name,
        custName: customerDetails[0].cust_name,
        custPhone: customerDetails[0].contact_no,
        quantity: eachCustomer.quantity,
        invoiceDate: eachCustomer.InvDate,
        custId: eachCustomer.cust_id
      }

      // console.log("++++++++++++++++++++++", response)

      responseArray.push(response)
    }

    return res.status(200).send({
      success: true,
      data: responseArray,
      message: "successfully fetched multiple item corresponding customer data.",
    });

  }
  catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching multiple customer report data.",
    });
  }

}



module.exports = {
  fetchCustomerReport,
  fetchItemtoCustomerReport
};
