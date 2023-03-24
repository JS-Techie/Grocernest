const { Op } = require("sequelize");
const db = require("../models");

const lkp_offers = db.lkpOffersModel;
const offers = db.OffersModel;
const item = db.ItemModel;
const customer = db.CustomerModel;

const Cart = db.CartModel;

/*
const isItemExists = async(item_x, item_y) =>{
    if(item_x!==null){
        let count=0;
        const xItem = item.findOne({
            where:{
                id: item_x
            }
        })
        if(xItem){
            if(item_y !== null){
                if(item_y.isArray){
                    item_y.map(async(object)=>{
                        const yItem = await item.findOne({
                            where:{
                                id: item_y
                            }
                        })
                        if(yItem) {
                            count++;
                        }else{
                            return object
                        }
                    })
                    if(count===item_y.size()){
                       return true
                    }
                }else{
                const yItem = await item.findOne({
                    where:{
                        id: item_y
                    }
                })
                if(yItem) {
                    return true
                }else{
                    return item_y
                }
                }
            } 
        }     
    }else{
        return item_x
    }   
}*/

const isTypePresent = async (type_id) => {
    const type = await lkp_offers.findOne({
        where: {
            id: type_id
        }
    })
    if (type) {
        return true
    }
    return false
}

const validationForExistingOffer = async (item_x, item_x_quantity) => {
    const existingOffer = await offers.findOne({
        where: {
            item_x, item_x_quantity
        }
    })
    if (existingOffer) {
        return true
    }
    return false
}

const validationForExistingOfferUpdate = async (item_x, item_x_quantity, offerID) =>{
    const existingOffer = await offers.findOne({
        where: {
            item_x, item_x_quantity,
            [Op.not]: [{id: offerID}]
        }
    })
    if (existingOffer) {
        return true
    }
    return false
}


const validationForYItem = async (item_x, item_y) => {
    const existingOfferItem = await offers.findOne({
        where: {
            item_x, item_y
        }
    })
    if (existingOfferItem) {
        return true
    }
    return false
}
const validationForYItemUpdate = async (item_x, item_y, offerId) => {
    const existingOfferItem = await offers.findOne({
        where: {
            item_x, item_y,
            [Op.not]: [{id: offerId}]
        }
    })
    if (existingOfferItem) {
        return true
    }
    return false
}

const validationForDiscount = async(item_x, amount_of_discount, is_percentage) =>{
    const existingDiscount = await offers.findOne({
        where:{
            item_x,
            amount_of_discount,
            is_percentage: (is_percentage===true)?1:null
        }
    })
    if(existingDiscount){
        return true
    }
    return false
}

const validationForDiscountUpdate = async (item_x, amount_of_discount, is_percentage, offerID) =>{
    const existingDiscount = await offers.findOne({
        where:{
            item_x,
            amount_of_discount,
            is_percentage: (is_percentage===true)?1:null,
            [Op.not]: [{id:offerID}]
        }
    })
    if(existingDiscount){
        return true
    }
    return false
}

const typeIdDetails = async (type_id)=>{
    const details = await lkp_offers.findOne({
        where:{id:type_id}
    })
    if(details){
        return details
    }
    return false
}

const offerItemDuplicacyCheckType3 = async(offerDetails)=>{
    let duplicate = null
    let result = []
    let offerItems = []
   if(offerDetails.item_y){
    offerItems = offerDetails.item_y
   }
   
   for(i=0; i<offerItems.length; i++){
     for(j=0; j<offerItems.length; j++){
        if(i!=j){
           if(offerItems[i]==offerItems[j]){
              result.push(offerItems[i])
           }
        }  
     }
   }
   if(result.length>0){
    return result
   }
   return false
}

const xSpecificYItemValidationType3 = async(offerDetails)=>{
    let allYItems = null
    let collectionOfY = []
    const isExists = await offers.findAll({
        where:{
            type_id: offerDetails.type_id,
            item_x: offerDetails.item_x,
        }
    })
    //console.log("isExists "+isExists)
    if(isExists){
        isExists.map((each_obj)=>{
            //console.log("each_obj "+each_obj.item_y)
            collectionOfY.push(each_obj.item_y)
        })
    }
    console.log("collectionOfY "+collectionOfY)
    let result=[]
    console.log("First Size "+result.length)
    if(offerDetails.item_y){
        console.log("yes, array")
        offerDetails.item_y.map((y)=>{
            const res = collectionOfY.includes(y)
            console.log("isExists: "+res)
            if(res){
              result.push(y)
            }
        })
    }
    console.log("Result: "+result)
    const val = result.length
    console.log("The val "+val)
    if(result.length>0){
        return result
    }
    return false
}

const xSpecificYItemValidationType3Update = async(offerDetails, offerID)=>{
    let collectionOfY = []
    const isExists = await offers.findAll({
        where:{
            type_id: offerDetails.type_id,
            item_x: offerDetails.item_x,
            [Op.not]: [{id:offerID}]
        }
    })
    if(isExists){
        isExists.map((each_obj)=>{
            //console.log("each_obj "+each_obj.item_y)
            collectionOfY.push(each_obj.item_y)
        })
    }
    console.log("collectionOfY "+collectionOfY)
    let result=[]
    console.log("First Size "+result.length)
    if(offerDetails.item_y){
        console.log("yes, array")
        offerDetails.item_y.map((y)=>{
            const res = collectionOfY.includes(y)
            console.log("isExists: "+res)
            if(res){
              result.push(y)
            }
        })
    }
    console.log("Result: "+result)
    const val = result.length
    console.log("The val "+val)
    if(result.length>0){
        return result
    }
    return false
}


const buyXGetAnyYCreation = async (offerDetails)=>{
    let ultimateValue = []
    offerDetails.item_y.map((requestYItem)=>{
        const value = {
            type_id: offerDetails.type_id,
            item_x: offerDetails.item_x,
            item_y: requestYItem,
            item_x_quantity: offerDetails.item_x_quantity,
            item_y_quantity: offerDetails.item_y_quantity,
            item_z: offerDetails.item_z,
            amount_of_discount: offerDetails.amount_of_discount,
            is_percentage: offerDetails.is_percentage !== null ? (offerDetails.is_percentage === true ? 1 : null) : null,
            created_by: 1,
            is_active: 1,
            is_percentage: offerDetails.is_percentage,
            start_date: offerDetails.start_date,
            end_date: offerDetails.end_date,
            start_time: offerDetails.start_time,
            end_time: offerDetails.end_time,
            is_pos: offerDetails.is_pos,
            is_ecomm: offerDetails.is_ecomm,
            is_time: offerDetails.is_time,
          } 
          ultimateValue.push(value)
        })
        fieldValidation(offerDetails)
        const offerBulk = offers.bulkCreate(ultimateValue) 
        return  offerBulk
}

const buyXGetAnyYUpdate = async (offerDetails, offerID)=>{
    let ultimateValue = []
    offerDetails.item_y.map((requestYItem)=>{
        const value = {
            type_id: offerDetails.type_id,
            item_x: offerDetails.item_x,
            item_y: requestYItem,
            item_x_quantity: offerDetails.item_x_quantity,
            item_y_quantity: offerDetails.item_y_quantity,
            item_z: offerDetails.item_z,
            amount_of_discount: offerDetails.amount_of_discount,
            is_percentage: offerDetails.is_percentage !== null ? (offerDetails.is_percentage === true ? 1 : null) : null,
            created_by: 1,
            is_active: 1,
            is_percentage: offerDetails.is_percentage,
            start_date: offerDetails.start_date,
            end_date: offerDetails.end_date,
            start_time: offerDetails.start_time,
            end_time: offerDetails.end_time,
            is_pos: offerDetails.is_pos,
            is_ecomm: offerDetails.is_ecomm,
            is_time: offerDetails.is_time,
          } 
          ultimateValue.push(value)
        })

}

const fieldValidation =  (offerDetails)=>{
    if (offerDetails.is_time && (!offerDetails.start_date || !offerDetails.start_time || !offerDetails.end_date || !offerDetails.end_time)) {
        return res.status(400).send({
          success: false,
          data: [],
          message: "Please enter correct details for time based offers",
        });
    }
    if (!offerDetails.is_pos && !offerDetails.is_ecomm) {
        return res.status(400).send({
          success: false,
          data: [],
          message: "Please specify if this offer is for POS or ecomm or both",
        });
    }
}

const itemCombinationValidation = async (item_x, item_y)=>{
    if(item_x!==null && item_y!==null){
        const combitation = await offers.findOne({
            where:{
               item_x,
               item_y,
               [Op.or]:[{type_id:4},{type_id:5}]
            }
        })
        if(combitation){
           return combitation
        }
        return false  
    }    
}

const offerItemValidationType4 = async (item_z, type_id)=>{
    if(item_z!==null && type_id!==null){
        const exists = await offers.findOne({
            where:{
                item_z,
                type_id
            }
        })
        if(exists){
            return true
        }
        return false
    }    
}



const cartCreation = async (currentUser, yItemQty, yItemQtyToBeAdded)=>{
    let ultimateValue = []
    yItemQty.map((requestYItem)=>{
        let index = yItemQty.indexOf(requestYItem)
        const value = {
            cust_no: currentUser,
            item_id: requestYItem,
            quantity: yItemQtyToBeAdded[index],
            created_by: 1,
            is_offer: 1,
            offer_item_price: 0
          } 
          ultimateValue.push(value)
        })
        const cartBulk = Cart.bulkCreate(ultimateValue) 
        return  cartBulk
}

const collectAllYItem = async (itemX)=>{
    let all_offer_qty = []
    const offer = await offers.findAll({
        where: {
          is_active: 1,
          item_x: itemX,
        },
      });
    if(offer){
        offers.map((each_offer)=>{
            all_offer_qty.push(each_offer.item_x_quantity)
          })
    }  
    return all_offer_qty
   
}



module.exports = {
    isTypePresent,
    validationForExistingOffer,
    validationForYItem,
    validationForDiscount,
    typeIdDetails,
    buyXGetAnyYCreation,
    fieldValidation,
  //  isItemExists
    itemCombinationValidation,
    offerItemValidationType4,
    xSpecificYItemValidationType3,
    offerItemDuplicacyCheckType3,
    validationForExistingOfferUpdate,
    validationForYItemUpdate,
    validationForDiscountUpdate,
    xSpecificYItemValidationType3Update,
    cartCreation,
    collectAllYItem
}