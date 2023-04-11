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
        const phoneNum = phoneNumber ? `and t_customer.contact_no= "${phoneNumber}"` : ``
        const innerJoinQuery = phoneNumber ? `inner join t_customer on t_order.cust_no = t_customer.cust_no` : ``
        const dateRange = dateSelection === "L" ? "month(t_order.created_at)=month(now())-1 " : `t_order.created_at between "${fromDate}" and "${toDate}"`
        const amountRange = amountGreaterThan ? `where T2.total_purchase>= ${amountGreaterThan} ` : ``


        const searchCustomersForCouponsQuery = `select T2.*, t_customer.cust_name, t_customer.contact_no from 
        (select *, sum(T1.final_payable_amount) as total_purchase
         from 
        (select t_order.* from t_order ${innerJoinQuery} where ${dateRange} ${phoneNum})T1 group by T1.cust_no)T2 inner join t_customer on T2.cust_no = t_customer.cust_no ${amountRange}`


        const [searchResults, metadata] = await sequelize.query(searchCustomersForCouponsQuery)

        let responseData = []

        for (let i in searchResults) {
            const eachCustomerData = searchResults[i]
            let generateFlag
            const customerPresent = await sequelize.query(`select * from t_ext_coupon_customer_map where cust_no="${eachCustomerData.cust_no}"`)
            if (!customerPresent) {
                generateFlag = "Coupon Generated"
            }
            else {
                generateFlag = "Coupon Not Generated"
            }
            const eachResponse = {
                "customerNo": eachCustomerData.cust_no,
                "customerName": eachCustomerData.cust_name,
                "contactNo": eachCustomerData.contact_no,
                "totalPurchase": eachCustomerData.total_purchase,
                "generateFlag": generateFlag
            }
            responseData.push(eachResponse)
        }

        console.log("-------------------------------------", responseData)



        if (!responseData) {
            return res.status(400).send({
                success: true,
                status: 400,
                message: " No Data to Fetch with the selected Filters"
            })
        }

        return res.status(200).send({
            data: responseData,
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

    } catch (error) {
        return res.status(500).send({
            success: false,
            status: 500,
            message: "Coupons Not Generated. Error Occured. Please Try Again Later",
            error: error.message
        })
    }


}








const viewCoupon = async (req, res) => {

    const {
        customerNo
    } = req.body


    try {
        if (!customerNo) {
            return res.status(400).send({
                success: false,
                message: "Customer Number Not supplied. No Coupon Data Fetched"
            })
        }

        const mapTableResponse = await ExternalCouponCustomerMap.findAll({
            where: { cust_no: customerNo }
        })

        const couponDetailsPromise = await mapTableResponse.map(async (eachCoupon) => {
            const eachCouponDetail = await ExternalCoupon.findOne({
                where: { coupon_code: eachCoupon.coupon_code }
            })

            const response = {
                customerNo: eachCoupon.cust_no,
                couponCode: eachCoupon.coupon_code,
                expiryDate: eachCouponDetail.expiry_date,
                issueDate: eachCouponDetail.start_date,

            }
            return response
        })

        const couponDetails = await Promise.all(couponDetailsPromise)
        res.status(200).send({
            success: true,
            message: "Coupons Fetched Successfully",
            data: couponDetails,
            status: 200
        })
    }
    catch (error) {
        return res.status(500).send({
            success: false,
            message: "Coupons could not be Fetched. Please Try Again Later",
            status: 500,
            error: error.message
        })
    }
}








const vendorSearch = async (req, res) => {

    const {
        couponCode,
        phoneNumber
    } = req.body

    if (!couponCode || !phoneNumber) {
        return res.status(400).send({
            status: 400,
            success: false,
            message: "Mandatory Fields of Coupon Code and Phone Number are not filled UP"
        })
    }
    try {

        const couponSearchQuery = ` select * from t_ext_coupon_customer_map where coupon_code="${couponCode}" and cust_no=(select cust_no from t_customer where contact_no="${phoneNumber}" ) `

        const [couponCodeValidation, metadata] = await sequelize.query(couponSearchQuery)
        if (!couponCodeValidation) {
            return res.status(404).send({
                success: false,
                message: "Phone No doesnot Correspond with the provided coupon code",
                status: 404
            })
        }
        const [couponDetailResult, metadata1] = await sequelize.query(`select * from t_ext_coupon where coupon_code = "${couponCodeValidation[0].coupon_code}" `)

        const response = {
            "customerPhone": phoneNumber,
            "couponCode": couponCodeValidation[0].coupon_code,
            "expiryDate": couponDetailResult[0].expiry_date
        }
        res.status(200).send({
            data: response,
            success: false,
            status: 200,
            message: "Coupon Found and Fetched Successfully"
        })



    } catch (error) {
        return res.status(500).send({
            message: "Coupon Not Found. Please Try Again after sometime.",
            success: false,
            status: 500,
            errorL: error.message
        })
    }


}











const vendorCouponRedemption = async (req, res) => {

    const {
        couponCode,
        phoneNumber
    } = req.body

    if (!couponCode || !phoneNumber) {
        return res.status(400).send({
            status: 400,
            success: false,
            message: "Coupon Code and Phone Number are not Provided"
        })
    }

    try {

        const couponSearchQuery = ` select * from t_ext_coupon_customer_map where coupon_code="${couponCode}" and cust_no=(select cust_no from t_customer where contact_no="${phoneNumber}" ) `

        const [couponCodeValidation, metadata] = await sequelize.query(couponSearchQuery)
        // console.log("==============-------------------==-------------======================", couponCodeValidation)
        if (!couponCodeValidation) {
            return res.status(404).send({
                success: false,
                message: "Phone No doesnot Correspond with the provided coupon code",
                status: 404
            })
        }

        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const updateQuery = `update t_ext_coupon set status="redeemed" where coupon_code = "${couponCodeValidation[0].coupon_code}" and expiry_date>="${today}"`
        const redeemUpdate = await sequelize.query(updateQuery)

        if (redeemUpdate === 0) {
            return res.status(400).send({
                message: "Coupon has Expired. Cannot be Redeemed",
                status: 400,
                success: false
            })
        }

        res.status(200).send({
            message: "Coupon Redeemed Successfully",
            success: true,
            status: 200
        })


    }
    catch (error) {
        return res.status(500).send({
            message: "Coupon Not Found. Please Try Again after sometime.",
            success: false,
            status: 500,
            errorL: error.message
        })
    }
}






module.exports = {
    searchTotalPurchaseController,
    generateCoupon,
    viewCoupon,
    vendorSearch,
    vendorCouponRedemption
}

