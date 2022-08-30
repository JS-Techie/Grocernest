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

  module.exports = {
    responseFormat,
    // findNameAndQuantity,
  }