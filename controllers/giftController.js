const { Op } = require("sequelize");
const { sequelize } = require("../models");

const db = require("../models");

const Order = db.OrderModel;
const Batch = db.BatchModel;
const Cart = db.CartModel;
const Strategy = db.GiftStrategyModel;
const Inventory = db.InventoryModel;

const getAllGifts = async (req, res, next) => {
  //Get current user from jwt
  const currentUser = req.cust_no;

  try {
    //get all orders for current user and order them in descending order to find the latest first
    const ordersForCurrentUser = await Order.findAll({
      where: { cust_no: currentUser },
      order: [["created_at", "DESC"]],
    });

    if (ordersForCurrentUser.length === 0) {
      return res.status(200).send({
        success: true,
        data: {
          noOfGiftsApplicable: 0,
        },
        message:
          "This user has no previous orders, therefore gifts are not applicable",
      });
    }

    //get the latest order total to send gifts based on the rule engine
    // if(latestOrder.status === "Cancelled"){
    //   return res.status(200).send({
    //     success : true,
    //     data: [],
    //     message : "No "
    //   })
    // }

    const previousOrder = ordersForCurrentUser[0];
    console.log(previousOrder);
    if (previousOrder.status === "Cancelled") {
      return res.status(200).send({
        success: true,
        data: [],
        message:
          "There are no gifts for current user because their previous order was cancelled",
      });
    }
    const latestOrder = ordersForCurrentUser[0].total;

    console.log(latestOrder);

    //   const [gifts, metadata] =
    //     await sequelize.query(`select t_item.id, t_item.name,t_item.brand_id,t_item.UOM ,t_item.category_id,t_item.sub_category_id
    //     ,t_item.image ,t_item.description,t_lkp_color.color_name, t_lkp_brand.brand_name
    //     from ((t_item
    //           inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
    //           inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
    //           where t_item.is_gift = 1 order by t_item.id
    // `);

    const [gifts, metadata] =
      await sequelize.query(`select t_item.id, t_item.name,t_item.brand_id,t_item.category_id,t_item.sub_category_id
  ,t_item.image ,t_item.description,t_lkp_color.color_name, t_lkp_brand.brand_name,t_batch.MRP,t_batch.sale_price,t_batch.cost_price ,t_batch.discount 
  ,t_batch.mfg_date,t_inventory.quantity 
  from ((((t_item
        inner join t_lkp_color on t_lkp_color.id = t_item.color_id)
        inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id)
        inner join t_batch on t_batch.item_id = t_item.id)
        inner join t_inventory on t_inventory.batch_id = t_batch.id)
        where t_item.is_gift = 1 and t_batch.mark_selected = 1 and t_inventory.location_id = 4 and t_inventory.balance_type = 1 and t_inventory.quantity > 0 order by t_inventory.quantity`);

    console.log("GIFTS=====>", gifts);

    //Get all the gifts that exist
    let oldestBatch = null;

    if (gifts.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no gift items",
      });
    }
    const promises = gifts.map(async (current) => {
      // oldestBatch = await Batch.findOne({
      //   where: { item_id: current.id, mark_selected: 1 },
      // });

      // console.log("Selected batch of item====>", oldestBatch);

      // let currentItem;
      // if (oldestBatch) {
      //   currentItem = await Inventory.findOne({
      //     where: {
      //       item_id: current.id,
      //       batch_id: oldestBatch.id,
      //       balance_type: 1,
      //       location_id: 4,
      //     },
      //   });
      // }

      // console.log("Current item=====>", currentItem);

      // if (oldestBatch && currentItem) {
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
        // };
      };
    });

    const resolved = await Promise.all(promises);
    console.log("GIfts array before removing undefined======>", resolved);
    const resolvedWithoutUndefined = resolved.filter((current) => {
      return current !== undefined;
    });

    console.log("Resolved array=====>", resolvedWithoutUndefined);

    //returning only distinct items and not duplicates
    let giftsArray;
    if (resolvedWithoutUndefined.length !== 0) {
      giftsArray = [
        ...new Map(
          resolvedWithoutUndefined.map((item) => [item["itemID"], item])
        ).values(),
      ];
    }
    console.log("Gifts====>", giftsArray);

    //response array based on rule engine
    // let response;
    // let noOfGiftsApplicable;

    // if (latestOrder > 3000) {
    //   response = giftsArray;
    //   noOfGiftsApplicable = 7;
    // } else if (latestOrder >= 2001 && latestOrder <= 3000) {
    //   response = giftsArray.slice(0, 10);
    //   noOfGiftsApplicable = 5;
    // } else if (latestOrder >= 1001 && latestOrder <= 2000) {
    //   response = giftsArray.slice(0, 5);
    //   noOfGiftsApplicable = 3;
    // } else {
    //   response = giftsArray.slice(0, 3);
    //   noOfGiftsApplicable = 1;
    // }

    let response;

    //Finding the first gift strategy that matches
    const strategy = await Strategy.findOne({
      where: {
        min_purchase: {
          [Op.lte]: latestOrder,
        },
        max_purchase: {
          [Op.gte]: latestOrder,
        },
      },
    });

    console.log(strategy);

    if (!strategy) {
      return res.status(200).send({
        success: true,
        data: {
          gifts: [],
          noOfGiftsApplicable: 0,
        },
        message: "No gift strategies found",
      });
    }

    response = giftsArray ? giftsArray : [];

    // .slice(0, strategy.no_of_gifts + 4)

    return res.status(200).send({
      success: true,
      data: {
        gifts: response,
        noOfGiftsApplicable: giftsArray
          ? strategy.no_of_gifts
            ? strategy.no_of_gifts
            : 0
          : 0,
      },
      message: "Found all gifts",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while fetching gift details, please check data field for more details",
    });
  }
};

const applyGifts = async (req, res, next) => {
  // get current user from jwt
  const currentUser = req.cust_no;

  try {
    const { gifts } = req.body;

    const promises = gifts.map(async (current) => {
      return {
        cust_no: currentUser,
        item_id: current,
        quantity: 1,
        created_by: 1,
        is_gift: 1,
      };
    });

    const resolved = await Promise.all(promises);

    try {
      const response = await Cart.bulkCreate(resolved);

      return res.status(201).send({
        success: true,
        data: response,
        message:
          "Successfully added gifts to cart, user can proceed to checkout",
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        data: error.message,
        message:
          "Something went wrong while adding gifts for user, please check data field for more details",
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "Something went wrong while adding gifts for user, please check data field for more details",
    });
  }
};

module.exports = {
  getAllGifts,
  applyGifts,
};
