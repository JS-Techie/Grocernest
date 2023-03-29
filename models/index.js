const { sequelize, Sequelize } = require("sequelize");
const db = require("../services/dbSetupService");

db.BatchModel = require("./t_batch")(db.sequelize, Sequelize);

db.CustNoteModel = require("./t_cust_note")(db.sequelize, Sequelize);

db.CustomerModel = require("./t_customer")(db.sequelize, Sequelize);

db.GrnDetailsModel = require("./t_grn_details")(db.sequelize, Sequelize);

db.GrnModel = require("./t_grn")(db.sequelize, Sequelize);

db.InventoryAuditModel = require("./t_inventory_audit")(
  db.sequelize,
  Sequelize
);

db.InventoryModel = require("./t_inventory")(db.sequelize, Sequelize);

db.InvoiceItemDtlsModel = require("./t_invoice_item_dtls")(
  db.sequelize,
  Sequelize
);

db.InvoiceOutOfStockModel = require("./t_invoice_out_of_stock")(
  db.sequelize,
  Sequelize
);

db.InvoicePartPaymentModel = require("./t_invoice_part_payment")(
  db.sequelize,
  Sequelize
);

db.InvoiceModel = require("./t_invoice")(db.sequelize, Sequelize);

db.ItemTaxInfoModel = require("./t_item_tax_info")(db.sequelize, Sequelize);

db.ItemModel = require("./t_item")(db.sequelize, Sequelize);

db.LkpBalanceTypeModel = require("./t_lkp_balance_type")(
  db.sequelize,
  Sequelize
);

db.LkpBrandModel = require("./t_lkp_brand")(db.sequelize, Sequelize);

db.LkpCategoryModel = require("./t_lkp_category")(db.sequelize, Sequelize);

db.LkpColorModel = require("./t_lkp_color")(db.sequelize, Sequelize);

db.LkpDepartmentModel = require("./t_lkp_department")(db.sequelize, Sequelize);

db.LkpDivisionModel = require("./t_lkp_division")(db.sequelize, Sequelize);

db.LkpLocationModel = require("./t_lkp_location")(db.sequelize, Sequelize);

db.LkpSizeModel = require("./t_lkp_size")(db.sequelize, Sequelize);

db.LkpSubCategoryModel = require("./t_lkp_sub_category")(
  db.sequelize,
  Sequelize
);

db.LowStockConfigModel = require("./t_low_stock_config")(
  db.sequelize,
  Sequelize
);

db.ModuleRoleModel = require("./t_module_role")(db.sequelize, Sequelize);

db.ModuleModel = require("./t_module")(db.sequelize, Sequelize);

db.NotificationModel = require("./t_notification")(db.sequelize, Sequelize);

db.RegionModel = require("./t_region")(db.sequelize, Sequelize);

db.RoleModel = require("./t_role")(db.sequelize, Sequelize);

db.StockAdjustmentModel = require("./t_stock_adjustment")(
  db.sequelize,
  Sequelize
);

db.StockTransferDetailsModel = require("./t_stock_transfer_details")(
  db.sequelize,
  Sequelize
);

db.StockTransferModel = require("./t_stock_transfer")(db.sequelize, Sequelize);

db.SupplierModel = require("./t_supplier")(db.sequelize, Sequelize);

db.UserRoleModel = require("./t_user_role")(db.sequelize, Sequelize);

db.UserModel = require("./t_user")(db.sequelize, Sequelize);

db.WalletTransactionModel = require("./t_wallet_transaction")(
  db.sequelize,
  Sequelize
);
db.SpecialWalletTransactionModel = require("./t_special_wallet_transaction")(
  db.sequelize,
  Sequelize
);


db.WalletModel = require("./t_wallet")(db.sequelize, Sequelize);

db.CouponToCustomerModel = require("./t_coupon_to_customer")(
  db.sequelize,
  Sequelize
);

db.CustomerToCouponMappingModel = require("./t_customer_coupon_mapping")(
  db.sequelize,
  Sequelize
);

db.WishlistModel = require("./t_lkp_wishlist")(db.sequelize, Sequelize);

db.AddressModel = require("./t_address")(db.sequelize, Sequelize);

db.WishlistItemsModel = require("./t_wishlist_items")(db.sequelize, Sequelize);

db.OrderModel = require("./t_order")(db.sequelize, Sequelize);

db.OrderItemsModel = require("./t_order_items")(db.sequelize, Sequelize);

db.CartModel = require("./t_cart")(db.sequelize, Sequelize);

db.ProfileModel = require("./t_profile")(db.sequelize, Sequelize);

db.CacheModel = require("./t_cache")(db.sequelize, Sequelize);

db.CouponsModel = require("./t_coupons")(db.sequelize, Sequelize);

db.GiftStrategyModel = require("./t_gift_strategy")(db.sequelize, Sequelize);

db.lkpOffersModel = require("./t_lkp_offer")(db.sequelize, Sequelize);

db.OffersModel = require("./t_offers")(db.sequelize, Sequelize);

db.OffersCacheModel = require("./t_offer_cache")(db.sequelize, Sequelize);

db.SpecialWalletStrategy = require("./t_special_wallet_strategy")(
  db.sequelize,
  Sequelize
);

db.MilkItemsModel = require("./t_milk_items")(db.sequelize, Sequelize);

db.SubscriptionsModel = require("./t_subscription")(db.sequelize, Sequelize);

db.SubscriptionItemsModel = require("./t_subscription_items")(
  db.sequelize,
  Sequelize
);

db.MilkDeliveryModel = require("./t_milk_delivery")(db.sequelize, Sequelize);

db.GatewayTransactionModel = require("./t_gateway_transaction")(
  db.sequelize,
  Sequelize
);

db.LeaveModel = require("./t_leave.js")(db.sequelize, Sequelize);

db.UrlModel = require("./t_shorten_url.js")(db.sequelize, Sequelize);

db.TaskModel = require("./t_task")(db.sequelize, Sequelize);

db.AttendanceModel = require("./t_attendance")(db.sequelize, Sequelize);

db.FeedbackModel = require("./t_feedback")(db.sequelize, Sequelize);

db.ReturnOrdersModel = require("./t_return_orders")(db.sequelize, Sequelize);

db.MilkDashboardModel = require("./t_milk_dashboard")(db.sequelize, Sequelize);

db.VendorModel = require("./t_vendor")(db.sequelize, Sequelize);

db.VendorItemModel = require("./t_vendor_item")(db.sequelize, Sequelize);

db.BannerModel = require("./t_banner")(db.sequelize, Sequelize);

db.FeaturedBrandsModel = require("./t_featured_brands")(
  db.sequelize,
  Sequelize
);

db.FeaturedCategoryModel = require("./t_featured_categories")(
  db.sequelize,
  Sequelize
);

db.DemandModel = require("./t_demand")(db.sequelize, Sequelize);

db.NotifyModel = require("./t_notify")(db.sequelize, Sequelize);

db.ItemSpecificWalletModel = require("./t_item_wallet")(
  db.sequelize,
  Sequelize
);

db.MarketSurveyModel = require("./t_market_survey")(db.sequelize, Sequelize);

// Relations between tables

db.MilkDashboardModel.hasMany(db.SubscriptionItemsModel, {
  foreignKey: "subscription_id",
});

db.WalletModel.hasMany(db.WalletTransactionModel, { foreignKey: "wallet_id" }); //one to many mapping

// //One wishlist has many wishlist items
// db.WishlistModel.hasMany(db.WishlistItemsModel, { foreignKey: "wishlist_id" });

//One order has many order items
db.OrderModel.hasMany(db.OrderItemsModel, { foreignKey: "order_id" });
db.OrderItemsModel.hasMany(db.ItemModel, { foreignKey: "id" });

// db.OrderModel.hasMany(db.CustomerModel, { foreignKey: "cust_no" })

//One category has many subcategories
db.LkpCategoryModel.hasMany(db.LkpSubCategoryModel, {
  foreignKey: "category_id",
});

//One category has many items
db.LkpCategoryModel.hasMany(db.ItemModel, { foreignKey: "category_id" });

//One subcategory has many items
db.LkpSubCategoryModel.hasMany(db.ItemModel, { foreignKey: "sub_category_id" });

//One brand has many items
db.LkpBrandModel.hasMany(db.ItemModel, { foreignKey: "brand_id" });

db.WalletModel.hasMany(db.WalletTransactionModel, { foreignKey: "wallet_id" }); //one to many mapping

// Address table
db.CustomerModel.hasMany(db.AddressModel, { foreignKey: "cust_no" });

db.CartModel.hasMany(db.ItemModel, { foreignKey: "id" });

db.SubscriptionsModel.hasMany(db.SubscriptionItemsModel, {
  foreignKey: "subscription_id",
});

module.exports = db;
