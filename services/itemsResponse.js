const responseFormat = async (
  
    type,
    itemName,
    quantity,
    batch,
    image,
    alt,
    color,
    text
  ) => {
    return {
      
      type: type,
      itemName: itemName
        ? itemName.includes("undefined")
          ? itemName.replace("undefined", "").trim()
          : itemName
        : quantity,
      quantity: itemName
        ? quantity
        : "Could not find quantity for requested item",
      price: batch ? batch.sale_price : "Could not find price for requested item",
      image: image ? image : "Could not find image for requested item",
      alt: "TBD",
      clr: color ? color.color_name : "Could not find color for requested item",
      text: text ? text : "Could not find description for requested item",
    };
  };

  const findNameAndQuantity = async (currentItem) => {
    let itemName;
    let quantity;
    let item = currentItem.name.split(" ");
    item.map((currentString, index) => {
      if (index === item.length - 1) {
        quantity = currentString;
      } else {
        itemName += currentString + " ";
      }
    });
  
    let nameAndQuantity = new Array();
    nameAndQuantity[0] = itemName;
    nameAndQuantity[1] = quantity;
    return nameAndQuantity;
  };

  module.exports = {
    responseFormat,
    findNameAndQuantity,
  }