const db = require('../models')
const { sequelize } = require('../models')

const { Op } = require("sequelize")

const SpecialWalletStrategy = db.SpecialWalletStrategy
const Order = db.OrderModel
const OrderItems = db.OrderItemsModel


const returnItemShowController = async (req, res) => {

    const currentUser = req.cust_no;
    const orderId = req.params.orderId;


    try {

        let returnBlockFlag = false

        const orderedItems = await OrderItems.findAll({
            attributes: ['item_id'],
            where: { order_id: orderId },
            raw: true
        })

        const itemIDArray = orderedItems.map((currentItem) => {
            return currentItem.item_id
        })
        // console.log("=================", itemIDArray)

        const specialWalletStrategyItems = await SpecialWalletStrategy.findAll()
        // console.log("the ================", specialWalletStrategyItems)
        let responseObjArray = []
        let nonnonEmptyFlag = false
        specialWalletStrategyItems.forEach(itemList => {
            nonEmptyFlag = false
            itemListArray = JSON.parse(itemList.items_list)
            // console.log("the fetched item list is :", itemListArray, typeof (itemListArray))
            // console.log("the ordered item list is: ", itemIDArray)
            const intersectingIds = itemListArray.filter(arrayValue => itemIDArray.includes(parseInt(arrayValue)))
            let itemIdList = []
            if (intersectingIds.length !== 0) {
                nonEmptyFlag = true
                intersectingIds.forEach((arrayElement) => {
                    itemIdList.push(parseInt(arrayElement))
                })
            }
            // console.log("the item id list:::::", itemIdList)
            if (nonEmptyFlag) {
                const response = {
                    "strategyId": itemList.id,
                    "itemId": itemIdList
                }
                responseObjArray.push(response)
            }
        })

        // console.log("the array ::::::", responseObjArray)

        responseObjArray.forEach(async(objElement)=>{
            const strategyDetails=await SpecialWalletStrategy.findOne({
                where:{id: objElement.strategyId}
            })

            console.log("the fetched strategy details for each item", strategyDetails)
            const today= new Date()
            const todayDate= new Date(today)
            const strategyStartDate= new Date(strategyDetails.start_date)
            const strategyExpiryDate= new Date(strategyDetails.expiry_date)
            console.log("the todays date ------------", todayDate, typeof(todayDate))
            console.log("the start date=================", strategyStartDate, typeof(strategyStartDate))
            console.log("the expiry date --->>.>.", strategyExpiryDate, typeof(strategyExpiryDate))

            if(strategyStartDate<=todayDate<=strategyExpiryDate && strategyDetails.status===1 && strategyDetails.instant_cashback===1){
                console.log("this is a flag this is a flag this is a flag")

                if(strategyDetails.first_buy === 0){
                    returnBlockFlag===true
                }
                else{
                    const customerPreviousOrders = await Order.findAll({
                        where: {cust_no: currentUser}, 
                    })
                    customerPreviousOrders.forEach(async(eachOrderId)=>{
                        const prevOrderItemList=await OrderItems.findAll({
                            attributes: ['item_id'],
                            where:{order_id: eachOrderId.order_id, 
                                created_at :{[Op.between]: [strategyStartDate, strategyExpiryDate]} 
                            },
                            raw: true
                        })
                        console.log("=======--------------==========-----------=======",prevOrderItemList)
                        const orderedItemListId = prevOrderItemList.map((listObj)=>{



                            // const intersectingIds = object.filter(arrayValue => itemIDArray.includes(parseInt(arrayValue)))

                            
                        })
                    })
                    
                }

            }
        })

    }
    catch (error) {
        res.status(200).send({
            success: false,
            data: error.message,
            message: "Error Occured. Exception Met..."
        })
    }
}

module.exports = { returnItemShowController }