const db = require("../models");
const { sequelize } = require("../models");
const uniqid = require("uniqid");

// const Wallet = db.WalletModel
// const WalletTransaction = db.WalletTransactionModel;

class SpecialWalletService {
  creditAmount = async (amount, cust_no, details) => {
    try {
      let transaction_id = uniqid();
      const [results, metadata] = await sequelize.query(`
                UPDATE t_wallet
                SET item_specific_balance = (select item_specific_balance from t_wallet where cust_no="${cust_no}")+${amount}
                WHERE cust_no = "${cust_no}"
              `);

      const [results2, metadata2] = await sequelize.query(`
                INSERT INTO t_special_wallet_transaction
                (wallet_id, transaction_id, transaction_type, transaction_amount, transaction_details, transaction_date_time, created_by, updated_by, created_at, updated_at)
                VALUES((
                select wallet_id from t_wallet where cust_no="${cust_no}"
                ), "${transaction_id}", "C", ${amount}, "${details}", current_timestamp(), 2, NULL, current_timestamp(), current_timestamp()); 
            `);

      const [results3, metadata3] = await sequelize.query(`
                select balance from t_wallet where cust_no="${cust_no}"
              `);

      return {
        success: true,
        data: results3[0],
        message: "Amount successfully added to the wallet",
      };
    } catch (error) {
      return {
        success: false,
        data: error.message,
        message: "Error while adding amount to the wallet",
      };
    }
  };
}

module.exports = SpecialWalletService;
