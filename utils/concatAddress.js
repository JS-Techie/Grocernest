const db = require("../models");
const Address = db.AddressModel;

const concatAddress = async (addressID) => {
  const addressResponse = await Address.findOne({
    where: { address_id: addressID },
  });

  if(!addressResponse){
    return (" ");
  }

  const address = new String(
    addressResponse.address_title +
    " " +
    addressResponse.address_line_1 +
    " " +
    addressResponse.address_line_2 +
    " " +
    addressResponse.city +
    " ," + 
    " " + addressResponse.state + " :" + " " + addressResponse.PIN_code
  )

  return address;
};

module.exports = concatAddress;
