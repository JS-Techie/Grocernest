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

        let returnBlockItemsLists = []
        let returnBlockItems = []


        const orderedItems = await OrderItems.findAll({
            where: { order_id: orderId },
        })

        // console.log("the orderedItems are ::::::::::::::: ",orderedItems)

        const itemIDArray = orderedItems.map((currentItem) => {
            return currentItem.item_id
        })
        // console.log("=================", itemIDArray)

        const specialWalletStrategyItems = await SpecialWalletStrategy.findAll()
        // console.log("the ================", specialWalletStrategyItems)
        let responseObjArray = []
        let nonnonEmptyFlag = false
        for (var i in specialWalletStrategyItems) {
            itemList = specialWalletStrategyItems[i]
            nonEmptyFlag = false
            itemListArray = JSON.parse(itemList.items_list)
            // console.log("the fetched item list is :", itemListArray, typeof (itemListArray))
            // console.log("the ordered item list is: ", itemIDArray)
            const intersectingIds = itemListArray.filter(arrayValue => itemIDArray.includes(parseInt(arrayValue)))
            let itemIdList = []
            if (intersectingIds.length !== 0) {
                nonEmptyFlag = true
                for(var j in intersectingIds){
                    arrayElement= intersectingIds[j]
                    itemIdList.push(parseInt(arrayElement))
                }
            }
            // console.log("the item id list:::::", itemIdList)
            if (nonEmptyFlag) {
                const response = {
                    "strategyId": itemList.id,
                    "itemId": itemIdList
                }
                responseObjArray.push(response)
            }
        }

        // console.log("the array ::::::", responseObjArray)

        for (let i in responseObjArray) {

            objElement = responseObjArray[i]

            // console.log("each obj element ^^^^^^^^^^>>>>>>>>>>>>>>>", objElement)


            const strategyDetails = await SpecialWalletStrategy.findOne({
                where: { id: objElement.strategyId }
            })

            // console.log("the fetched strategy details for each item", strategyDetails)
            const today = new Date()
            const todayDate = new Date(today)
            const strategyStartDate = new Date(strategyDetails.start_date)
            const strategyExpiryDate = new Date(strategyDetails.expiry_date)
            // console.log("the todays date ------------", todayDate, typeof(todayDate))
            // console.log("the start date=================", strategyStartDate, typeof(strategyStartDate))
            // console.log("the expiry date --->>.>.", strategyExpiryDate, typeof(strategyExpiryDate))

            if (strategyStartDate <= todayDate <= strategyExpiryDate && strategyDetails.status === 1 && strategyDetails.instant_cashback === 1) {
                if (strategyDetails.first_buy === 0) {
                    returnBlockItemsLists.push(objElement.itemId)
                }
                else {


                    const customerPreviousOrders = await Order.findAll({
                        where: {
                            cust_no: currentUser,
                            created_at: { [Op.between]: [strategyStartDate, strategyExpiryDate] }
                        },
                    })

                    for(let z in customerPreviousOrders){
                        eachOrderId=customerPreviousOrders[z]

                        const prevOrderItemList = await OrderItems.findAll({
                            attributes: ['item_id'],
                            where: {
                                order_id: eachOrderId.order_id
                            },
                            raw: true
                        })


                        const prevOrderedItemIdArray = prevOrderItemList.map((currentItem) => {
                            return currentItem.item_id
                        })
                        // console.log("=======--------------==========-----------=======",prevOrderedItemIdArray)
                        // console.log("-------==============----------===========-------",objElement.itemId)


                        const nonIntersectingIds = objElement.itemId.filter(arrayValue => !prevOrderedItemIdArray.includes(parseInt(arrayValue)))
                        // console.log("******************------------------*************", nonIntersectingIds)
                        if (nonIntersectingIds.length !== 0) {
                            // console.log("the non intersecting ids :--------------------:>", nonIntersectingIds)
                            returnBlockItemsLists.push(nonIntersectingIds)
                            // console.log("**************99999999999999999999*************", returnBlockItemsLists)
                        }
                    }

                }

            }
            for (let j in returnBlockItemsLists) {
                itemArray = returnBlockItemsLists[j]
                // console.log("this is a check flag~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", itemArray)
                for (let k in itemArray) {
                    eachItem = itemArray[k]
                    returnBlockItems.push(eachItem)
                    console.log("the return block items :::=======:::=======:::", returnBlockItems)
                }
            }



        }


        cleanReturnBlockArray = returnBlockItems.filter((item,
            index) => returnBlockItems.indexOf(item) === index);
        // console.log("the clean return block items :::---------------------------::", cleanReturnBlockArray)


        const responsePromise = await orderedItems.map((eachItemOrdered) => {
            let returnBlockFlag = false
            console.log("each item ordered :", eachItemOrdered)
            if (cleanReturnBlockArray.includes(eachItemOrdered.item_id)) {
                returnBlockFlag = true
            }
            return ({
                "itemDetails": eachItemOrdered,
                "returnBlockFlag": returnBlockFlag
            })
        })

        const response = await Promise.all(responsePromise)


        return res.status(200).send({
            success: true,
            message: "successfully fetched data",
            data: response,
            status: 200
        })

    }
    catch (error) {
        res.status(500).send({
            success: false,
            data: error.message,
            message: "Error Occured. Exception Met..."
        })
    }
}

module.exports = { returnItemShowController }