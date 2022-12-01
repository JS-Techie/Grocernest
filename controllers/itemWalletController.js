const db = require("../models");

const Customer = db.CustomerModel;
const ItemWallet = db.ItemSpecificWalletModel;
const CustomerItemWallet = db.CustomerItemWalletModel;
const CustomerItemWalletTransaction = db.CustomerItemWalletTransactionModel;

const getWalletBalance = async (req, res, next) => {
  const { cust_no } = req;
  try {
    const currentCustomerWallet = await CustomerItemWallet.findOne({
      where: { cust_no },
    });

    if (!currentCustomerWallet) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There is no item specific wallet for you currently",
      });
    }

    return res.status(200).send({
      success: true,
      data: currentCustomerWallet,
      message: "Found requested wallet for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

const getTransactionHistory = async (req, res, next) => {
  const { cust_no } = req;
  try {
    const currentCustomerWallet = await CustomerItemWallet.findOne({
      where: { cust_no },
    });

    if (!currentCustomerWallet) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There is no item specific wallet for you currently",
      });
    }

    const transactions = await CustomerItemWalletTransaction.findAll({
      where: { wallet_id: currentCustomerWallet.id },
    });

    if (transactions.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no wallet transactions for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: transactions,
      message:
        "Found all the transactions of item specific wallet for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
    });
  }
};

module.exports = {
  getWalletBalance,
  getTransactionHistory,
};
