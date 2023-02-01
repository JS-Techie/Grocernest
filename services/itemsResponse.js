const { sequelize } = require("../models");
const db = require("../models");


const ItemTaxInfo = db.ItemTaxInfoModel;

const responseFormat = async (
    id,
    UOM,
    type,
    itemName,
    batch,
    image,
    alt,
    color,
    text,
    brand
  ) => {
    return {
      
      itemId : id,
      UOM : UOM,
      type: type,
      itemName: itemName? itemName : "No name found",
      sale_price: batch ? batch.sale_price : "Could not find price for requested item",
      MRP : batch ? batch.MRP : "Could not find MRP for requested item",
      discount : batch ? batch.discount : "Could not find discount for requested item",
      image: image ? image : "Could not find image for requested item",
      alt: "TBD",
      clr: color ? color.color_name : "Could not find color for requested item",
      description: text ? text : "Could not find description for requested item",
      brand : brand ? brand.brand_name : "Could not find brand for requested item"
    };
  };

  // const findNameAndQuantity = async (currentItem) => {
  //   let itemName;
  //   let quantity;
  //   let item = currentItem.name.split(" ");
  //   item.map((currentString, index) => {
  //     if (index === item.length - 1) {
  //       quantity = currentString;
  //     } else {
  //       itemName += currentString + " ";
  //     }
  //   });
  
  //   let nameAndQuantity = new Array();
  //   nameAndQuantity[0] = itemName;
  //   nameAndQuantity[1] = quantity;
  //   return nameAndQuantity;
  // };

  const getItemTaxArray = async (item_id) => {
    const itemTaxInfoList = await ItemTaxInfo.findAll({
      where: { item_id: item_id },
    });
    let response = [];
    if (itemTaxInfoList.length > 0) {
      const promises = itemTaxInfoList.map((current) => {
        return {
          createdBy: current.created_by,
          createdAt: current.created_at,
          updatedBy: current.updated_by,
          updatedAt: current.updated_at,
          isActive: current.active_ind,
          id: current.id,
          itemId: current.item_cd,
          taxType: current.tax_type,
          taxName: current.tax_name,
          taxPercentage: current.tax_percentage,
        };
      });
    
      response = await Promise.all(promises);
    }
    console.log(response);
    return response;
  };
  module.exports = {
    responseFormat,
    getItemTaxArray
    // findNameAndQuantity,
  }