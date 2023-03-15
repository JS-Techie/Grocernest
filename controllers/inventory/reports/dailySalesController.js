const { sequelize } = require("../../../models");

const db = require("../../../models");
const Customer = db.CustomerModel;
const Invoice = db.InvoiceModel;

const invoiceRaised = async (req, res, next) => {
  const { fromDate, toDate, locationIdList } = req.body;

  try {
    if (locationIdList.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Please enter correct locationIdList",
        data: [],
      });
    }
    const [getInvoices, metadata] =
      await sequelize.query(`select t_customer.comments ,t_customer.address ,t_customer.contact_no ,t_customer.email ,t_customer.cust_name ,t_invoice.created_at ,t_invoice.id ,t_invoice.invoice_no ,t_invoice.invoice_type ,t_invoice.location_id ,t_invoice.original_invoice_id ,t_invoice.payment_type ,t_invoice.total_quantity ,t_invoice.return_flag ,t_invoice.store_name ,t_invoice.teller_name ,t_invoice.total_amount ,t_invoice.total_discount 
    from (t_invoice 
    inner join t_customer on t_customer.id = t_invoice.cust_id )
    where t_invoice.created_at between "${fromDate}" and "${toDate}" and t_invoice.location_id = "${locationIdList}"
    `);
    if (getInvoices.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Requested invoice not found",
        data: [],
      });
    }
    const promises = getInvoices.map((current) => {
      return {
        comment: current.comments,
        customerAddress: current.address,
        customerContactNo: current.contact_no,
        customerEmail: current.email,
        customerName: current.cust_name,
        invoiceDate: current.created_at,
        invoiceId: current.id,
        invoiceNo: current.invoice_no,
        invoiceType: current.invoice_type,
        locationId: current.location_id,
        originalInvoiceId: current.original_invoice_id,
        originalInvoiceNo: current.invoice_no,
        paymentMode: current.payment_type,
        quantity: current.total_quantity,
        returnFlag: current.return_flag,
        storeName: current.store_name,
        tellerName: current.teller_name,
        totalAmount: current.total_amount,
        totalDiscount: current.total_discount,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched the requested invoices",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , please try again later",
      data: error.message,
    });
  }
};

const paymentSummary = async (req, res, next) => {
  const { fromDate, locationIdList, toDate } = req.body;
  try {
    // if (locationIdList.length === 0) {
    //   return res.status(200).send({
    //     status: 400,
    //     message: "Please enter location id list",
    //     data: [],
    //   });
    // }
    const [paymentDetails, metadata] = await sequelize.query(`select * 
      from t_invoice
      where t_invoice.created_at BETWEEN "${fromDate}" and "${toDate}" and t_invoice.location_id = "${locationIdList}"`);

    if (paymentDetails.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Requested payment details not found",
        data: [],
      });
    }
    const promises = paymentDetails.map((current) => {
      return {
        amount: current.total_amount,
        paymentType: current.payment_type,
        tellerName: current.teller_name,
      };
    });
    const resolved = await Promise.all(promises);
    const paymentSummaryDetails = paymentDetails.map((current) => {
      return {
        tellerName: "",
        amount: current.total_amount,
        paymentType: current.payment_type,
      };
    });
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched the data",
      data: {
        paymentSummaryDetails,
        paymentSummaryTellerDetails: resolved,
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again later",
      data: error.message,
    });
  }
};

module.exports = {
  invoiceRaised,
  paymentSummary,
};
