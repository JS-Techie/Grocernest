const { Op } = require("sequelize");
const db = require("../models");

const lkp_offers = db.lkpOffersModel;
const offers = db.OffersModel;
const item = db.ItemModel;
const customer = db.CustomerModel;

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

const typeIdDetails = async (type_id)=>{
    const details = await lkp_offers.findOne({
        where:{id:type_id}
    })
    if(details){
        return details
    }
    return false
}


const buyXGetAnyYCreation = async (offerDetails)=>{
    let ultimateValue = []
    offerDetails.item_y.map((object)=>{
        const value = {
            type_id: offerDetails.type_id,
            item_x: offerDetails.item_x,
            item_y: object,
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
    offerItemValidationType4
    
}