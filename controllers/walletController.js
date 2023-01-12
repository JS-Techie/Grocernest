const db = require("../models");

const Wallet = db.WalletModel;
const WalletTransaction = db.WalletTransactionModel;
const { sequelize } = require("../models");

// Find all the transactions of particular customer and send it
const getAllTransactionsOfUser = (req, res, next) => {
  // Get current user from JWT
  const customer_no = req.cust_no;

  Wallet.findAll({
    include: [
      {
        model: WalletTransaction,
      },
    ],
    where: {
      cust_no: customer_no,
    },
    order: [["created_at", "ASC"]],
  })
    .then((resData) => {
      return res.status(201).json({
        success: true,
        data: resData,
        message: "Successfully fetched Transaction Data",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        data: error.message,
        message: "Error while fetching transaction from database",
      });
    });
};

// Get Wallet Balance of a customer
const getBalanceOfUser = async (req, res, next) => {
  // Get current user from JWT
  const customer_no = req.cust_no;

  Wallet.findAll({
    where: { cust_no: customer_no },
  })
    .then((dbRes) => {
      res.send({
        success: true,
        data: dbRes,
        message: "",
      });
    })
    .catch((error) => {
      return res.status(400).json({
        success: false,
        data: error.message,
        message: "Error while fetching balance from database",
      });
    });
};
const getAllSpecialTransactionsOfUser = async (req, res, next) => {
  // Get current user from JWT
  const customer_no = req.cust_no;

  try {
    const [all_transactions, metadata_2] =
      await sequelize.query(`select * from t_special_wallet_transaction tswt where tswt.wallet_id = 
    (select wallet_id from t_wallet tw where tw.cust_no="${customer_no}")`);

    return res.status(200).send({
      success: true,
      data: all_transactions,
      message: "Fetched all special wallet transaction",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message:
        "something went wrong while fetching the special wallet transaction",
    });
  }
};

module.exports = {
  getAllTransactionsOfUser,
  getBalanceOfUser,
  getAllSpecialTransactionsOfUser,
};
