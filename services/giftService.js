const { response } = require("express");
const { Op } = require("sequelize");
const { sequelize } = require("../models");

const db = require("../models");
const Strategy = db.GiftStrategyModel;
const Order = db.OrderModel;

const getGifts = async (order_id) => {
  const [gifts, metadata] =
    await sequelize.query(`select t_item.id, t_item.name,t_item.brand_id,t_item.category_id,t_item.sub_category_id
  ,t_item.image ,t_item.description,t_lkp_color.color_name, t_lkp_brand.brand_name,t_batch.MRP,t_batch.sale_price,t_batch.cost_price ,t_batch.discount 
  ,t_batch.mfg_date,t_inventory.quantity 
  from ((((t_item
    inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
    inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
    inner join t_batch on t_batch.item_id = t_item.id)
    inner join t_inventory on t_inventory.batch_id = t_batch.id)
   where t_item.is_gift = 1 and t_batch.mark_selected = 1 and t_inventory.location_id = 4 and t_inventory.balance_type = 1 order by t_inventory.quantity`);

  const currentOrder = await Order.findOne({
    where: { order_id },
  });

  if (currentOrder.status === "Cancelled") {
    return [];
  }

  const promises = gifts.map(async (current) => {
    return {
      itemID: current.id,
      itemName: current.name,
      availableQuantity: current.quantity,
      categoryID: current.category_id,
      MRP: current.MRP,
      discount: current.discount,
      costPrice: current.cost_price,
      mfgDate: current.mfg_date,
      salePrice: current.sale_price,
      color: current.color_name,
      brand: current.brand_name,
    };
  });

  const resolved = await Promise.all(promises);
  const resolvedWithoutUndefined = resolved.filter((current) => {
    return current !== undefined;
  });
  let giftsArray;
  if (resolvedWithoutUndefined.length !== 0) {
    giftsArray = [
      ...new Map(
        resolvedWithoutUndefined.map((item) => [item["itemID"], item])
      ).values(),
    ];
  }

  const strategy = await Strategy.findOne({
    where: {
      min_purchase: {
        [Op.lte]: currentOrder.total,
      },
      max_purchase: {
        [Op.gte]: currentOrder.total,
      },
    },
  });

  let response = [];

  if (strategy) {
    response = giftsArray ? giftsArray.slice(0, strategy.no_of_gifts + 4) : [];
  }

  return response;
};

module.exports = { getGifts };
