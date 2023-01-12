const db = require("../models");

const Wallet = db.WalletModel;
const WalletTransaction = db.WalletTransactionModel;
const { sequelize } = require("../models");

// Find all the transactions of particular customer and send it
const getAllTransactionsOfUser = async (req, res, next) => {
  // Get current user from JWT

  try {
    const customer_no = req.cust_no;

    const [wallet_info, metadata] = await sequelize.query(
      `SELECT * from t_wallet tw where tw.cust_no ="${customer_no}"`
    );
    let wallet_data = wallet_info[0];
    const [wallet_transaction, metadata_2] = await sequelize.query(
      `SELECT * from t_wallet_transaction twt where twt.wallet_id ="${wallet_data.wallet_id}" order by twt.transaction_date_time DESC`
    );

    return res.status(200).send({
      success: true,
      data: {
        wallet_data,
        wallet_transaction,
      },
      message: "Successfully fetched wallet transaction",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: err.message,
      message: "Error while fetching transaction from database",
    });
  }
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
