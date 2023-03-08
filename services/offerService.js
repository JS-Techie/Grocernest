const { op } = require("sequelize");
const db = require("../models");

const lkp_offers = db.lkpOffersModel;
const offers = db.OffersModel;
const item = db.ItemModel;
const customer = db.CustomerModel;


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
       where:{ id:type_id }
    })
    if(details){
        return details
    }
    return false
}

module.exports = {
    isTypePresent,
    validationForExistingOffer,
    validationForYItem,
    validationForDiscount,
    typeIdDetails
}
