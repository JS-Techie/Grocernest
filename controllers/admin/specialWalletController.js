const db = require("../../models");
const { sequelize } = require("../../models");
const uniqid = require("uniqid");

const WalletStrategy = db.SpecialWalletStrategy;
const itemTable = db.ItemModel;

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
    is_instant_cashback,
    is_first_buy,
    redeem_amt,
  } = req.body;
  try {
    //validations
    if (
      !offer_name ||
      !amount_of_discount ||
      !is_percentage ||
      !items_list ||
      !status ||
      !start_date ||
      !expiry_date ||
      !is_instant_cashback ||
      !is_first_buy
    ) {
      return res.status(400).send({
        success: false,
        data: "",
        message:
          "Some fields are missing, please provide them. required fields are (offer_name, amount_of_discount, is_percentage, items_list, status, start_date, expiry_date, is_instant_cashback, is_first_buy)",
      });
    }

    let strategy_id = uniqid();

    const new_strategy = await WalletStrategy.create({
      id: strategy_id,
      offer_name,
      offer_desc,
      amount_of_discount: parseInt(amount_of_discount),
      is_percentage: parseInt(is_percentage),
      items_list: JSON.stringify(items_list),
      status,
      start_date,
      expiry_date,
      instant_cashback: parseInt(is_instant_cashback),
      first_buy: parseInt(is_first_buy),
      created_by: 1,
      redeem_amt: parseInt(redeem_amt),
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

const viewStrategy = async (req, res, next) => {
  try {
    let item_name_list = [];
    let allStrategy = await WalletStrategy.findAll({});
    console.log(allStrategy);

    //loop through strategies
    const s_p = allStrategy.map(async (currentStrategy) => {
      item_list = currentStrategy.items_list;

      let item_name_list = [];
      const item_name_list_p = JSON.parse(item_list)
        .map(async (item_id) => {
          console.log(item_id);
          let item = await itemTable.findOne({
            where: {
              id: item_id,
            },
          });
          return {
            id: item?.id,
            name: item?.name,
          };
        })
        .filter((current) => {
          return current !== undefined;
        });
      item_name_list = await Promise.all(item_name_list_p);
      currentStrategy["items_list"] = item_name_list;
      return currentStrategy;
    });

    const strategies = await Promise.all(s_p);
    return res.status(200).send({
      success: true,
      data: strategies,
      message: "Fetched",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const editStrategy = async (req, res, next) => {};

const deleteStrategy = async (req, res, next) => {};

module.exports = {
  createStrategy,
  viewStrategy,
  editStrategy,
  deleteStrategy,
};
