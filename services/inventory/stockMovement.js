const { sequelize } = require("../../models");
const db = require("../../models");

const Inventory = db.InventoryModel;

const stockTransferValidator = async (
  requestType,
  itemDetails,
  fromLocationId,
  toLocationId,
  batchId,
  itemId,
  despatchedQuantity
) => {
  if (
    requestType == "STOCK_REQUEST_ACTION_REQUESTED" ||
    requestType == "STOCK_TRANSFER_ACTION_DESPATCHED"
  ) {
    return { validate: true };
  }
  if (itemDetails.length === 0) {
    return { validate: false };
  }
  const promises = itemDetails.map(async (current) => {
    const inventoryDetails = await Inventory.findOne({
      where: {
        item_id: itemId,
        batch_id: batchId,
        location_id: fromLocationId,
        active_ind: "Y",
        balance_type: "4",
      },
    });
    if (batchId) {
      return { validate: true };
    }
    if (toLocationId) {
      return { validate: true };
    }
  });
  const resolved = await Promise.all(promises)
  if (itemId) {
    if (despatchedQuantity == inventoryDetails.quantity) {
      return { validate: true };
    }
    return { validate: true };
  }
  return  resolved;
};

const createBalance = async(itemId, batchId, locationId, balanceType, addQuantity, caskBack, cashBackIsPercentage) => {
  const inventoryObj = await  Inventory.findOne({where :{batch_id: batchId, location_id:locationId, item_id: itemId, balance_type: "1"}})
  if(!inventoryObj){
    const newInventoryObj = await Inventory.create({
      batch_id:batchId,
      location_id:locationId,
      item_id:itemId,
      quantity:addQuantity,
      active_ind: "Y",
      created_by: "1",
      created_at: Date.now(),
      updated_by: "1",
      updated_at: Date.now(),
      balance_type:balanceType,
      cashback:caskBack,
      cashback_is_percentage:cashBackIsPercentage
    })
    return resizeBy.status(200).send({
      status: 200,
      message: "Successfully created a new inventory object",
      data: newInventoryObj
    })
  }
  const updateInventoryObj= await Inventory.update({quantity:addQuantity,cashback:caskBack, cashback_is_percentage: cashBackIsPercentage},{where: {item_id:itemId}})
  const updatedInventoryObj = await Inventory.findOne({where :{batch_id: batchId, location_id:locationId, item_id: itemId, balance_type: "1"}})
  return res.status(200).send({
    status: 200,
    message: "Successfully updated the inventory object",
    data: updatedInventoryObj
  })
}

module.exports = {
    stockTransferValidator,
    createBalance
}
