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
    let allStrategy = await WalletStrategy.findAll({});
    console.log(allStrategy);

    //loop through strategies
    const strategies = allStrategy.map(async (currentStrategy) => {
      console.log(currentStrategy.items_list);
      // const thisStrategy = await currentStrategy.findOne({
      //   where: { id: currentLeave.user_id },
      // });
    });

    return res.status(200).send({
      success: true,
      data: allStrategy,
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
