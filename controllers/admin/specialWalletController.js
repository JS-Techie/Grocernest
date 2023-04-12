const { Json } = require("sequelize/lib/utils");
const db = require("../../models");
const { sequelize } = require("../../models");
const uniqid = require("uniqid");
const { Op } = require("sequelize");

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


    const AlreadyPresentAllItemListsSearchOutput = await WalletStrategy.findAll({
      attributes: ['items_list'],
    })
    var AlreadyPresentItemListsArray = []
    const getItemsFunc = (item) => {
      eachItemsList = JSON.parse(item.dataValues.items_list);

      eachItemsList.forEach((ele) => {
        AlreadyPresentItemListsArray.push(ele)
      })
    }

    AlreadyPresentAllItemListsSearchOutput.map(getItemsFunc)

    console.log(typeof (items_list))
    var flag = 0
    items_list.forEach((ele) => {
      AlreadyPresentItemListsArray.forEach((ele1) => { if (ele1 === ele) { flag = 1 } })
    })
    console.log(flag)

    if (flag === 1) {
      return res.status(404).json({
        success: false,
        message: "Same Item cannot be provided with more than one offer strategy",
      })
    }

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

    // search any strategy is "ALL" or not, if ALL ia active then DEACTIVATE all
    // const all_strategies = await WalletStrategy.findAll({});
    // all_strategies.map((current_strategy) => {
    // })

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

          if (item_id == "all") {
            return {
              id: "all",
              name: "all",
            };
          }
          return {
            id: item.item_cd,

            name: item.name,
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

const editStrategy = async (req, res, next) => { };

const deleteStrategy = async (req, res, next) => {
  const { strategy_id } = req.body;
  try {
    if (!strategy_id) {
      return res.status(400).send({
        success: false,
        data: "",
        message: "strategy_id is required",
      });
    }

    const deleted_strategy = await WalletStrategy.destroy({
      where: {
        id: strategy_id,
      },
    });

    return res.status(200).send({
      success: true,
      data: deleted_strategy,
      message: "Strategy deleted successfully",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};









const toggleStrategy = async (req, res, next) => {
  const { strategy_id, status } = req.body;

  try {


    // THE CONFUSING, COMPLEX AND LONG LOGIC REGARDING EXTRACTING THE ITEM CODES AND CHECK THEIR COINCIDENCE

    const AlreadyPresentAllItemListsSearchOutput = await WalletStrategy.findAll({     //returns a string that looks like an array
      attributes: ['items_list'],
      where:{
        [Op.not]: [{id: strategy_id}]
      },
      raw: true
    })

    let AlreadyPresentItemListsArray = []   //for storing all the items fetched as an individual string in a list

    for (let i in AlreadyPresentAllItemListsSearchOutput) {
      const eachItemArray = AlreadyPresentAllItemListsSearchOutput[i].items_list //taking of each string - "["93483","38932"]"
      const arrayFormat = eachItemArray.slice(1, (eachItemArray.length - 1)).split(",") //first stripping off the square braces and then splitting them off on commas
      for (let j in arrayFormat) {
        eachItemFromArray = arrayFormat[j]  
        AlreadyPresentItemListsArray.push(eachItemFromArray.split("\"")[1])   // splitting each element on the basis of double qoutes and taking the middle element i.e. the original code 
      }
    }


    const [strategyItemList, metadata5] = await sequelize.query(`select * from t_special_wallet_strategy where id="${strategy_id}"`)



    const strategyArrayFormat = strategyItemList[0].items_list.slice(1, (strategyItemList[0].items_list.length - 1)).split(",") //doing the same with the id fetched array

    let strategyItemArray = []
    for (let i in strategyArrayFormat) {
      const eachStrategyItem = strategyArrayFormat[i]
      strategyItemArray.push(eachStrategyItem.split("\"")[1]) //doing the same above process to extract the original item codes
    }


    for (let element of strategyItemArray) {            //checking if the two arrays coincide 
      if (AlreadyPresentItemListsArray.includes(element)) {
        return res.status(404).send({
          message: "Coupon could not be activated as some items are already present in other offer strategy",
          data:[],
          status: 404,
          success: false
        })
      }
    }

    

    let updated_wallet_strategy = await WalletStrategy.update(
      {
        status: parseInt(status),
      },
      {
        where: {
          id: strategy_id,
        },
      }
    );

    return res.status(200).send({
      success: true,
      data: { status: status },
      message: "Strategy activated/deactivated successfully",
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      data: err.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  createStrategy,
  viewStrategy,
  editStrategy,
  deleteStrategy,
  toggleStrategy,
};
