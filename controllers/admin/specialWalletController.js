const db = require("../../models");
const { sequelize } = require("../../models");
const uniqid = require("uniqid");

const WalletStrategy = db.SpecialWalletStrategy;

const createStrategy = async (req, res, next) => {
  const {
    offer_name,
    offer_desc,
    amount_of_discount,
    is_percentage,
    items_list,
    status,
    start_date,
    expiry_date,
  } = req.body;
  try {
    let strategy_id = uniqid();
    const new_strategy = await WalletStrategy.create({
      id: strategy_id,
      offer_name,
      offer_desc,
      amount_of_discount,
      is_percentage,
      items_list,
      status,
      start_date,
      expiry_date,
      created_by: 1,
    });
    return res.status(200).send({
      success: true,
      data: new_strategy,
      message: "Strategy created",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const viewStrategy = async (req, res, next) => {};

const editStrategy = async (req, res, next) => {};

const deleteStrategy = async (req, res, next) => {};

module.exports = {
  createStrategy,
  viewStrategy,
  editStrategy,
  deleteStrategy,
};
