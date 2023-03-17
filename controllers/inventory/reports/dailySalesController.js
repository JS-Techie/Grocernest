const { sequelize } = require("../../../models");

const db = require("../../../models");
const Customer = db.CustomerModel;
const Invoice = db.InvoiceModel;

const invoiceRaised = async (req, res, next) => {
  const { fromDate, toDate, locationIdList } = req.body;

  try {
    console.log("lalalalalaaalal")
    if (locationIdList.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Please enter correct locationIdList",
        data: [],
      });
    }


    const fromdateSplit= fromDate.split('/')
    const fromdateSplitArray = new Date(fromdateSplit[2],fromdateSplit[1],fromdateSplit[0])
    const fromdateString= JSON.stringify(fromdateSplitArray)
    const fromdateRemoveT=fromdateString.replace('T', ' ')
    const from_date=fromdateRemoveT.replace('Z','')



    const todateSplit= toDate.split('/')
    const todateSplitArray = new Date(todateSplit[2],todateSplit[1],todateSplit[0])
    const todateString= JSON.stringify(todateSplitArray)
    const todateRemoveT= todateString.replace('T', ' ')
    const to_date= todateRemoveT.replace('Z','')

    // const abc=new Date(from_date)



    const [getInvoices, metadata] =
      await sequelize.query(`select t_customer.comments ,t_customer.address ,t_customer.contact_no ,t_customer.email ,t_customer.cust_name ,t_invoice.created_at ,t_invoice.id ,t_invoice.invoice_no ,t_invoice.invoice_type ,t_invoice.location_id ,t_invoice.original_invoice_id ,t_invoice.payment_type ,t_invoice.total_quantity ,t_invoice.return_flag ,t_invoice.store_name ,t_invoice.teller_name ,t_invoice.total_amount ,t_invoice.total_discount 
    from (t_invoice 
    inner join t_customer on t_customer.id = t_invoice.cust_id )
    where t_invoice.created_at between ${from_date} and ${to_date} and t_invoice.location_id = ${locationIdList[0]}`);
    console.log("hiiiiiiiiiiii", getInvoices);

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


    

    const fromdateSplit= fromDate.split('/')
    const fromdateSplitArray = new Date(fromdateSplit[2],fromdateSplit[1],fromdateSplit[0])
    const fromdateString= JSON.stringify(fromdateSplitArray).replaceAll('T', ' ')
    const from_date=fromdateString.replaceAll('Z','')



    const todateSplit= toDate.split('/')
    const todateSplitArray = new Date(todateSplit[2],todateSplit[1],todateSplit[0])
    const todateString= JSON.stringify(todateSplitArray).replaceAll('T', ' ')
    const to_date= todateString.replaceAll('Z','')

    const abc=new Date(from_date)


    console.log("================================================",typeof(abc) , to_date);





    const [paymentDetails, metadata] = await sequelize.query(`select * 
      from t_invoice
      where t_invoice.created_at BETWEEN ${from_date} and ${to_date} and t_invoice.location_id = ${locationIdList[0]}`);

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

const generateSalesReport = async (req, res, next) => { 
  const { brandId, endDate, brandName, pageNo, pageSize, startDate, tellerId } =
    req.body;
  try {
    const offset = parseInt((pageNo - 1) * pageSize);
    const limit = parseInt(pageSize);

    const [getSalesReport, metadata] =
      await sequelize.query(`select t_lkp_brand.brand_name ,t_batch.cost_price ,t_invoice.created_at ,t_invoice.teller_name , t_invoice_item_dtls.sale_price ,t_invoice_item_dtls.item_id ,t_invoice_item_dtls.quantity 
    from ((((t_invoice_item_dtls
    inner join t_item on t_item.id = t_invoice_item_dtls.item_id )
    inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
    inner join t_invoice on t_invoice.id = t_invoice_item_dtls.invoice_id)
    inner join t_batch on t_batch.item_id = t_invoice_item_dtls.item_id )
    where t_invoice.created_at between ${startDate} and ${endDate} and t_item.brand_id= ${brandId} and t_lkp_brand.brand_name= ${brandName} and t_invoice.teller_name=${tellerId} limit ${limit} offset ${offset} `);

    const promise = getSalesReport.map(async (currentPrice) => {
      return {
        salesDate: currentPrice.created_at,
        tellerName: currentPrice.teller_name,
        totalSalesPrice: currentPrice.quantity * currentPrice.sale_price,
        totalQuantity: currentPrice.quantity,
        totalCostPrice: currentPrice.quantity * currentPrice.cost_price,
        totalProfit:
          currentPrice.quantity *
          (currentPrice.sale_price - currentPrice.cost_price),
        brandName: currentPrice.brand_name,
      };
    });

    const resolved = await Promise.all(promise);

    return res.status(200).send({
      status: 200,
      message: "Success",
      data: {
        currentPage: pageNo,
        items: resolved,
        totalRows: getSalesReport.length,
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Failure",
      data: error.message,
    });
  }
};


module.exports = {
  invoiceRaised,
  paymentSummary,
  generateSalesReport
  
};
