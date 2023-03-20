const { sequelize } = require("../../models");
const Sequelize = require('sequelize');
const db = require("../../models");


const Customer = db.CustomerModel
const Wallet = db.WalletModel


const getSpecialWalletCustomerList = async (req, res, next) => {
    // console.log("getCustomerList");  

    let search_term = req.params.phno ? req.params.phno : ""


    let customerQuery = `select t_customer.cust_no, t_customer.cust_name, t_customer.email, t_customer.contact_no,t_wallet.item_specific_balance
    from t_customer inner join t_wallet on t_customer.cust_no = t_wallet.cust_no
    where t_customer.contact_no like '%${search_term}%' and t_customer.active_ind='Y' limit 10`

    try {
        const [customerResponse, metadata] = await sequelize.query(customerQuery)

        // console.log("the response data: ", resData)
        return res.status(201).json({
            success: true,
            data: customerResponse,
            message: "Successfully fetched all Customer Data Regarding Special Wallet",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            data: error.message,
            message: "Error while fetching Customers",
        });
    }

}
module.exports = {
    getSpecialWalletCustomerList
}