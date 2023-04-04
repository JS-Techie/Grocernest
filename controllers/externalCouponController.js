const moment = require('moment')


const db = require('../models')
const { sequelize } = require('../models')
const { Op } = require("sequelize")

const ExternalCoupon = db.ExternalCouponModel
const ExternalCouponCustomerMap = db.ExternalCouponCustomerMap


const searchTotalPurchaseController = async (req, res) => {

    const {
        dateSelection,
        fromDate,
        toDate,
        amountGreaterThan,
        phoneNumber
    } = req.body


    if(dateSelection !== "L"){
        if(!fromDate || !toDate){
            return res.status(200).send({
                success: false,
                status: 400,
                message: "Date Fields are Empty though they are Mandotory Fields"
            })
        }
    }


    try {

        const phoneNum = phoneNumber ? `and t_customer.calling_number= "${phoneNumber}"` : ``
        const innerJoinQuery = phoneNumber ? `inner join t_customer on t_order.cust_no = t_customer.cust_no` : ``
        const dateRange = dateSelection === "L" ? "month(t_order.created_at)=month(now())-1 " : `t_order.created_at between "${fromDate}" and "${toDate}"`
        const amountRange = amountGreaterThan ? "where T2.total_purchase>= ${amountGreaterThan} ":`` 


        const searchCustomersForCouponsQuery = `select * from (select *, sum(T1.final_payable_amount) as total_purchase from 
        (select t_order.* from t_order ${innerJoinQuery} where ${dateRange} ${phoneNum})T1 group by T1.cust_no)T2`


        const [searchResults, metadata] = await sequelize.query(searchCustomersForCouponsQuery)

        if (!searchResults) {
            return res.status(400).send({
                success: true,
                status: 400,
                message: " No Data to Fetch with the selected Filters"
            })
        }

        return res.status(200).send({
            data: searchResults,
            success: true,
            status: 200,
            message: "Results Fetched Successfully"
        })


    }
    catch (error) {
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Something went wrong. Please Try Again Later.",
        })
    }

}

module.exports = { searchTotalPurchaseController }

