const moment = require('moment')



const { randomAlphanumericStringGenerator } = require('../services/randomAlphanumericStringGenerator')
const db = require('../models')
const { sequelize } = require('../models')
const { Op } = require("sequelize")
const { response } = require('express')

const ExternalCoupon = db.ExternalCouponModel
const ExternalCouponCustomerMap = db.ExternalCouponCustomerMapModel


const searchTotalPurchaseController = async (req, res) => {

    const {
        dateSelection,
        fromDate,
        toDate,
        amountGreaterThan,
        phoneNumber
    } = req.body


    if (dateSelection !== "L") {
        if (!fromDate || !toDate) {
            return res.status(200).send({
                success: false,
                status: 400,
                message: "Date Fields are Empty though they are Mandotory Fields"
            })
        }
    }


    try {

        // console.log(":::::::::::::::::::::::::::::", randomAlphanumericStringGenerator(7))
        const phoneNum = phoneNumber ? `and t_customer.calling_number= "${phoneNumber}"` : ``
        const innerJoinQuery = phoneNumber ? `inner join t_customer on t_order.cust_no = t_customer.cust_no` : ``
        const dateRange = dateSelection === "L" ? "month(t_order.created_at)=month(now())-1 " : `t_order.created_at between "${fromDate}" and "${toDate}"`
        const amountRange = amountGreaterThan ? `where T2.total_purchase>= ${amountGreaterThan} ` : ``


        const searchCustomersForCouponsQuery = `select T2.*, t_customer.cust_name, t_customesssr.calling_number from 
        (select *, sum(T1.final_payable_amount) as total_purchase
         from 
        (select t_order.* from t_order ${innerJoinQuery} where ${dateRange} ${phoneNum})T1 group by T1.cust_no)T2 inner join t_customer on T2.cust_no = t_customer.cust_no ${amountRange}`


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








const generateCoupon = async (req, res) => {

    const {
        customerNo,
        couponData,
        expiryDate
    } = req.body

    try {

        if (!customerNo) {
            return res.status(400).send({
                success: false,
                message: "Coupon not Generated. Customer Number not found ",
                status: 400
            })
        }
        if (!couponData) {
            return res.status(400).send({
                success: false,
                message: "Coupon Not Generated. No Coupon amount supplied."
            })
        }


        const generationPromise = await couponData.map(async (eachCouponData) => {


            // console.log("==================================", eachCouponData, typeof(eachCouponData))

            const couponCode = randomAlphanumericStringGenerator(7)

            const couponCreation = await ExternalCoupon.create({
                coupon_code: couponCode,
                start_date: new Date(),
                expiry_date: new Date(eachCouponData.expiryDate),
                coupon_amount: eachCouponData.couponAmount,
                status: "pending"
            })

            const couponCustomerMap = await ExternalCouponCustomerMap.create({
                cust_no: customerNo,
                coupon_code: couponCode,
                created_at: new Date()
            })
            const responseObj = {
                couponCode: couponCreation.couponCode,
                startDate: couponCreation.start_date,
                expiryDate: couponCreation.expiry_date,
                couponAmount: couponCreation.coupon_amount,
                status: couponCreation.status,
                customerNo: couponCustomerMap.cust_no,
            }

            return responseObj
        })

        const generationDataResponse = await Promise.all(generationPromise)

        res.status(200).send({
            success: true,
            data: generationDataResponse,
            status: 200,
            message: "Coupons Generated Successfully"
        })

    }catch(error){
        return res.status(500).send({
            success:false,
            status: 500,
            message: "Coupons Not Generated. Error Occured. Please Try Again Later",
            error: error.message
        })
    }


}








const viewCoupon = async(req, res) => {

    const {
        customerNo
    }= req.body


    try{
        if (!customerNo){
            return res.status(400).send({
                success: false,
                message: "Customer Number Not supplied. No Coupon Data Fetched"
            })
        }
        
        const mapTableResponse= await ExternalCouponCustomerMap.findAll({
            where: {cust_no: customerNo}
        })

        const couponDetailsPromise = await mapTableResponse.map(async(eachCoupon)=>{
            const eachCouponDetail = await ExternalCoupon.findOne({
                where: {coupon_code: eachCoupon.coupon_code}
            })

            const response= {
                customerNo: eachCoupon.cust_no,
                couponCode: eachCoupon.coupon_code,
                expiryDate: eachCouponDetail.expiry_date,
                issueDate: eachCouponDetail.start_date,

            }
            return response
        })

        const couponDetails= await Promise.all(couponDetailsPromise)
        res.status(200).send({
            success: true,
            message: "Coupons Fetched Successfully",
            data: couponDetails,
            status: 200
        })
    }
    catch(error){
        return res.status(500).send({
            success: false,
            message:"Coupons could not be Fetched. Please Try Again Later",
            status: 500,
            error: error.message
        })
    }
}



module.exports = {
    searchTotalPurchaseController,
    generateCoupon,
    viewCoupon
}

