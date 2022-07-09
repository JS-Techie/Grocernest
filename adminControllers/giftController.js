const db = require("../models");

const Item = db.ItemModel;
const Batch = db.BatchModel;
const Strategy = db.GiftStrategyModel;

const getGifts = async (req, res, next) => {
  try {
    const gifts = await Item.findAll({
      where: { is_gift: 1 },
    });

    if (gifts.length === 0) {
      return res.send(404).send({
        success: true,
        data: [],
        message: "No gifts found",
      });
    }

    const promises = gifts.map(async (current) => {
      const batches = await Batch.findAll({
        where: { item_id: current.id },
        order: [["created_at", "ASC"]],
      });

      let availableQuantity = 0;
      batches.map((current) => {
        availableQuantity += current.quantity;
      });

      const oldestBatch = batches[0];

      return {
        itemID: current.id,
        name: current.name,
        UOM: current.UOM,
        availableQuantity,
        categoryID: current.category_id,
        subcategoryID: current.sub_category_id,
        brandID: current.brand_id,
        colorID: current.color_id,
        batchNumber: oldestBatch.batch_no,
        MRP: oldestBatch.MRP,
        discount: oldestBatch.discount,
        costPrice: oldestBatch.cost_price,
        salePrice: oldestBatch.sale_price,
        mfgDate: oldestBatch.mfg_date,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all gifts",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const viewStrategies = async (req, res, next) => {
  try {
    const strategies = await Strategy.findAll();

    if (strategies.length === 0) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No strategies found",
      });
    }

    const promises = strategies.map(async (current) => {
      return {
        strategyID: current.id,
        minPurchase: current.min_purchase,
        maxPurchase: current.max_purchase,
        noOfGiftsApplicable: current.no_of_gifts,
      };
    });

    const response = await Promise.all(promises);

    return res.status(200).send({
      success: true,
      data: response,
      message: "Found all strategies",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const getStrategyById = async (req, res, next) => {
  const strategyID = req.params.id;

  try {
    const currentStrategy = await Strategy.findOne({
      where: { id: strategyID },
    });

    if (!currentStrategy) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "No strategy found for entered ID",
      });
    }

    return res.send({
      success: true,
      data: {
        strategyID,
        minPurchase: currentStrategy.min_purchase,
        maxPurchase: currentStrategy.max_purchase,
        noOfGiftsApplicable: currentStrategy.no_of_gifts,
      },
      message: "Requested Strategy found",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const createStrategy = async (req, res, next) => {
  const { min_purchase, max_purchase, no_of_gifts } = req.body;

  try {
    const newStrategy = await Strategy.create({
      min_purchase,
      max_purchase,
      no_of_gifts,
      created_by: 1,
    });

    return res.status(201).send({
      success: true,
      data: {
        strategyID: newStrategy.id,
        minPurchase: newStrategy.min_purchase,
        max_purchase: newStrategy.max_purchase,
        noOfGiftsApplicable: newStrategy.no_of_gifts,
      },
      message: "New strategy created successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const updateStrategy = async (req, res, next) => {
  const strategyID = req.params.id;
  const { min_purchase, max_purchase, no_of_gifts } = req.body;

  try {
    const exists = await Strategy.findOne({
      where: { id: strategyID },
    });

    if (!exists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested strategy does not exist",
      });
    }

    const updatedStrategy = await Strategy.update(
      {
        min_purchase: min_purchase ? min_purchase : exists.min_purchase,
        max_purchase: max_purchase ? max_purchase : exists.max_purchase,
        no_of_gifts: no_of_gifts ? no_of_gifts : exists.no_of_gifts,
      },
      {
        where: { id: strategyID },
      }
    );

    return res.status(200).send({
      success: true,
      data: {
        noOfRowsUpdated: updatedStrategy,
      },
      message: "Strategy successfully updated",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

const deleteStrategy = async (req, res, next) => {
  const strategyID = req.params.id;

  try {
    const exists = await Strategy.findOne({
      where: { id: strategyID },
    });

    if (!exists) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Requested strategy doesnt exist",
      });
    }

    const deletedStrategy = await Strategy.destroy({
      where: { id: strategyID },
    });

    return res.status(200).send({
      success: true,
      data: {
        noOfRowsUpdated: deletedStrategy,
      },
      message: "Requested strategy deleted successfully",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please check data field",
    });
  }
};

module.exports = {
  getGifts,
  viewStrategies,
  getStrategyById,
  createStrategy,
  updateStrategy,
  deleteStrategy,
};
