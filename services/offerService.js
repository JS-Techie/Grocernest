const t_offers = require("../models/t_offers")

const checkForTypeId2 = async (amount_of_discount, is_percentage, item_x) => {


    const existingOffer = await t_offers.findOne({
        where: { item_x, amount_of_discount, is_percentage }
    })


    if(existingOffer){
        return true
    }


    return true
}