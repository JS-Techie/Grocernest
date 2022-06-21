const { sequelize, Sequelize } = require("sequelize");
const db = require("../services/dbSetupService");


db.BatchModel = require("./t_batch")(db.sequelize, Sequelize);

db.CustNoteModel = require("./t_cust_note")(db.sequelize, Sequelize);

db.CustomerModel = require("./t_customer")(db.sequelize, Sequelize);

db.CustomerModel = require("./t_customer")(db.sequelize, Sequelize);

db.GrnDetailsModel = require("./t_grn_details")(db.sequelize, Sequelize);

db.GrnModel = require("./t_grn")(db.sequelize, Sequelize);

db.InventoryAuditModel = require("./t_inventory_audit")(db.sequelize, Sequelize);

db.InventoryModel = require("./t_inventory")(db.sequelize, Sequelize);

db.InvoiceItemDtlsModel = require("./t_invoice_item_dtls")(db.sequelize, Sequelize);

db.InvoiceOutOfStockModel = require("./t_invoice_out_of_stock")(db.sequelize, Sequelize);

db.InvoicePartPaymentModel = require("./t_invoice_part_payment")(db.sequelize, Sequelize);

db.InvoiceModel = require("./t_invoice")(db.sequelize, Sequelize);

db.ItemTaxInfoModel = require("./t_item_tax_info")(db.sequelize, Sequelize);

db.ItemModel = require("./t_item")(db.sequelize, Sequelize);

db.LkpBalanceTypeModel = require("./t_lkp_balance_type")(db.sequelize, Sequelize);

db.LkpBrandModel = require("./t_lkp_brand")(db.sequelize, Sequelize);

db.LkpCategoryModel = require("./t_lkp_category")(db.sequelize, Sequelize);

db.LkpColorModel = require("./t_lkp_color")(db.sequelize, Sequelize);

db.LkpDepartmentModel = require("./t_lkp_department")(db.sequelize, Sequelize);

db.LkpDivisionModel = require("./t_lkp_division")(db.sequelize, Sequelize);

db.LkpLocationModel = require("./t_lkp_location")(db.sequelize, Sequelize);

db.LkpSizeModel = require("./t_lkp_size")(db.sequelize, Sequelize);

db.LkpSubCategoryModel = require("./t_lkp_sub_category")(db.sequelize, Sequelize);

db.LowStockConfigModel = require("./t_low_stock_config")(db.sequelize, Sequelize);

db.ModuleRoleModel = require("./t_module_role")(db.sequelize, Sequelize);

db.ModuleModel = require("./t_module")(db.sequelize, Sequelize);

db.NotificationModel = require("./t_notification")(db.sequelize, Sequelize);

db.RegionModel = require("./t_region")(db.sequelize, Sequelize);

db.RoleModel = require("./t_role")(db.sequelize, Sequelize);

db.StockAdjustmentModel = require("./t_stock_adjustment")(db.sequelize, Sequelize);

db.StockTransferDetailsModel = require("./t_stock_transfer_details")(db.sequelize, Sequelize);

db.StockTransferModel = require("./t_stock_transfer")(db.sequelize, Sequelize);

db.SupplierModel = require("./t_supplier")(db.sequelize, Sequelize);

db.UserRoleModel = require("./t_user_role")(db.sequelize, Sequelize);

db.UserModel = require("./t_user")(db.sequelize, Sequelize);

db.WalletTransactionModel = require("./t_wallet_transaction")(db.sequelize, Sequelize);

db.WalletModel = require("./t_wallet")(db.sequelize, Sequelize);



// Relations between tables

db.WalletModel.hasMany(db.WalletTransactionModel);      //one to many mapping
db.WalletTransactionModel.belongsTo(db.WalletModel, {
    foreignKey: "wallet_id",
    as: "t_wallet_transaction_fk",
});



module.exports = db;

