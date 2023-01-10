const db = require("../models");
const { sequelize } = require("../models");
const uniqid = require("uniqid");

class SpecialWalletService {
  creditAmount = async (amount, cust_no, details, array) => {
    try {
      let transaction_id = uniqid();
      const [results, metadata] = await sequelize.query(`
                UPDATE t_wallet
                SET item_specific_balance = (select item_specific_balance from t_wallet where cust_no="${cust_no}")+${amount}
                WHERE cust_no = "${cust_no}"
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

  creditAmountTransaction(cust_no, transactionArray) {
    transactionArray.map(async (current) => {
      let transaction_id = uniqid();
      const [results2, metadata2] = await sequelize.query(`
              INSERT INTO t_special_wallet_transaction
              (wallet_id, transaction_id, transaction_type, transaction_amount, transaction_details, transaction_date_time, created_by, updated_by, created_at, updated_at)
              VALUES((
              select wallet_id from t_wallet where cust_no="${cust_no}"
              ), "${transaction_id}", "C", ${current.wallet_amt}, "for the offer ${current.offer_name} and order id 1${current.order_id} ", current_timestamp(), 2, NULL, current_timestamp(), current_timestamp()); 
          `);
    });
  }
}

module.exports = SpecialWalletService;
