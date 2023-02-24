const {op} = require("sequelize");
const db = require("../models");

const lkp_offers = db.lkpOffersModel;
const offers = db.OffersModel;
const item = db.ItemModel;
const customer = db.CustomerModel;


const isTypePresent = async(type_id)=>{
    const type = await lkp_offers.findOne({
        where: {
          id: type_id
        }
      })
    if(type){
        return true
    } 
    return false
}

const validationForTypeId1 = async (item_x, item_x_quantity) =>{
    const existingOffer = await offers.findAll({
        where: {
          item_x, item_x_quantity
        }
    })
    if(existingOffer){
        return true
    }
    return false
}

const checkForTypeId2 = async (amount_of_discount, is_percentage, item_x) => {
    const existingOffer = await t_offers.findOne({
        where: { item_x, amount_of_discount, is_percentage }
    })
    if(existingOffer){
        return true
    }
    return true
}

module.exports = {
    isTypePresent,
    validationForTypeId1,
    checkForTypeId2
}