const db = require('../../models');
const { sequelize } = require("../../models");
const uniqid = require('uniqid');
const WalletService = require('../../services/walletService');

// const Wallet = db.WalletModel
// const WalletTransaction = db.WalletTransactionModel;

const createStrategy = async (req, res, next) => {
    console.log("create");
}

const viewStrategy = async (req, res, next) => {

}

const editStrategy = async (req, res, next) => {

}

const deleteStrategy = async (req, res, next) => {

}


module.exports = {
    createStrategy,
    viewStrategy,
    editStrategy,
    deleteStrategy
}