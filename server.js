require("dotenv").config();

const pos_refferal_job = require("./CRON_REF_3"); //run first
const special_wallet_cashback_job = require("./CRON_REF_4"); //run 2nd
const refferal_job = require("./CRON_REF_1"); //run 3rd

// Swagger UI Setup abcde
const swaggerUI = require("swagger-ui-express");
const endPoint = require("./services/swagger/swagger-output.json");

//Express Setup
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

//Middleware
//We will later put the URL of frontend in the CORS config object so only frontend can call the API
// app.use(bodyParser.json({ limit: "100mb" }));
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );

app.use(express.json({ limit: "50mb" }));
const cors = require("cors");
const fileUpload = require("express-fileupload");
const xss = require("xss-clean");
app.use(cors());

app.use(fileUpload());
app.use(xss());

app.get("/", (req, res, next) => {
  res.send("Grocernest API");
});

// Swagger route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(endPoint));



// customer routers import
const authRouter = require("./routes/authRoutes");
const listRouter = require("./routes/listRoutes");
const cartRouter = require("./routes/cartRoutes");
const itemRouter = require("./routes/itemRoutes");
const walletRouter = require("./routes/walletRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const addressRouter = require("./routes/addressRoutes");
const profileRouter = require("./routes/profileRoutes");
const checkoutRouter = require("./routes/checkoutRoutes");
const orderRouter = require("./routes/ordersRoutes");
const returnItemShowRouter= require('./routes/returnItemShowRoutes');
const couponRouter = require("./routes/couponsRoutes");
const referralRouter = require("./routes/referralRoutes");
const giftRouter = require("./routes/giftRoutes");
const invoiceRouter = require("./routes/invoiceRoutes");
const offerRouter = require("./routes/offerRoutes");
const gatewayRouter = require("./routes/gatewayRoute");
const whatsappRouter = require("./routes/whatsappRoutes");
const leaveRouter = require("./routes/leaveRoutes");
const taskRouter = require("./routes/taskRoutes");
const posRouter = require("./routes/posRoutes");
const attendanceRouter = require("./routes/attendanceRoutes");
const feedbackRouter = require("./routes/feedbackRoutes");
const homePageRouter = require("./routes/homepageRoutes");
const adhocRouter = require("./routes/adhocRoutes");



// admin routers import
const adminOrderRouter = require("./routes/admin/orderRoutes");
const adminWalletRouter = require("./routes/admin/walletRoutes");
const adminSpecialWalletRouter=require("./routes/admin/walletSpecialRoutes")
const adminCustomerRouter = require("./routes/admin/customerRoutes");
const adminSpecialWalletCustomerRouter= require("./routes/admin/customerSpecialWalletRoutes")
const adminGiftRouter = require("./routes/admin/giftRoutes");
const adminCouponsRouter = require("./routes/admin/couponRoutes");
const adminOffersRouter = require("./routes/admin/offerRoutes");
const adminLeaveRouter = require("./routes/admin/leaveRoutes");
const adminTaskRouter = require("./routes/admin/taskRoutes");
const adminAttendanceRouter = require("./routes/admin/attendanceRoutes");
const adminDeliveryRouter = require("./routes/admin/deliveryBoyRoutes");
const adminItemsRouter = require("./routes/admin/itemRoutes");
const adminBannerRouter = require("./routes/admin/bannerRoutes");
const adminHomeRouter = require("./routes/admin/homeRoutes");
const adminFeaturedCategoryRouter = require("./routes/admin/featuredCategoryRoutes");
const adminItemWalletRouter = require("./routes/admin/itemWalletRoutes");
const adminEcommInvoiceRouter = require("./routes/admin/ecommInvoiceRoutes");
const adminReportRouter = require("./routes/admin/adminReportRouter");
const adminMarketSurveyRouter = require("./routes/admin/marketSurveyRoutes");

//delivery boy routes

const deliveryBoyOrderRouter = require("./routes/deliveryBoy/ordersRoutes");
const deliveryBoyMilkRouter = require("./routes/deliveryBoy/milkRoutes");

// milk routes import (user)

// milk routes import (admin)
const adminMilkItemsRouter = require("./routes/admin/milkItemsRoutes");
const SubscriptionRouter = require("./routes/subscriptionRoutes");
const deliveryRouter = require("./routes/deliveryRoutes");
const adminMilkSubscriptionRouter = require("./routes/admin/milkSubscriptionRoutes");
const adminVendorRouter = require("./routes/admin/vendorRoutes");
const adminVendorItemRouter = require("./routes/admin/vendorItemRoutes");
const adminDailySalesRouter = require("./routes/admin/dailySalesRoutes");
const couponToCustomer = require("./routes/admin/couponToCustomer");
const specialWalletRouter = require("./routes/admin/specialWalletRoutes");

// migration codes
const inventoryAuthRouter = require("./routes/inventory/authRoutes");
const userMasterRouter = require("./routes/inventory/masterData/userRoutes");
const brandMasterRouter = require("./routes/inventory/masterData/brandRoutes");


const updateSelfPasswordRouter = require("./routes/inventory/PasswordHandler/updateSelfPasswordRoutes")
const userMasterUpdatePasswordRouter= require("./routes/inventory/PasswordHandler/userMasterUpdatePasswordRoutes")
const authControllerRouter =require('./routes/authControllerRoutes')


//external coupon 
const externalCouponRouter = require("./routes/externalCouponRoutes")

const sizeMasterRouter = require("./routes/inventory/masterData/sizeRoutes");
const locationMaster = require("./routes/inventory/masterData/locationRoutes");
const colorMasterRouter = require("./routes/inventory/masterData/colorRoutes");

const divisionMasterRouter = require("./routes/inventory/masterData/divisionRoutes");
const departmentMasterRouter = require("./routes/inventory/masterData/departmentRoutes");
const categoryMasterRouter = require("./routes/inventory/masterData/categoryRoutes");
const subCategoryMasterRouter = require("./routes/inventory/masterData/subCategoryRoutes");
const itemMasterRouter = require("./routes/inventory/masterData/itemRoutes");
const masterDataRouter = require("./routes/inventory/masterData/masterDataRoutes")

//reports import
const dailySalesReportRouter = require("./routes/inventory/reports/dailySalesRoutes")

//stockTransfer import
// const stockTransferRouter = require("./routes/inventory/stockTransfer/stockMovementRoutes");


//grn
const grnDraftSaveRouter = require("./routes/inventory/grn/grnDraftSaveRoutes");


//Vendor routes import
const vendorRouter = require("./routes/vendor/profileRoutes");

//routes
app.get("/responses", (req, res) => {
  res.send(endPoint);
});

// inventory master data routes
app.use(inventoryAuthRouter);

app.use("/inventory/colormaster", colorMasterRouter);
app.use("/inventory/usermaster", userMasterRouter);
app.use("/inventory/brandmaster", brandMasterRouter);
app.use("/inventory/sizemaster", sizeMasterRouter);
app.use("/inventory/locationmaster", locationMaster);
app.use("/inventory/divisionmaster", divisionMasterRouter);
app.use("/inventory/departmentmaster", departmentMasterRouter);
app.use("/inventory/categorymaster", categoryMasterRouter);
app.use("/inventory/subCategorymaster", subCategoryMasterRouter);
app.use("/inventory/itemmaster", itemMasterRouter)
app.use(masterDataRouter)
//report routes
app.use("/inventory/dailySalesReport", dailySalesReportRouter)

// inventory grn routes
app.use("/inventory/grn", grnDraftSaveRouter);
app.use("/inventory/passwordhandler", updateSelfPasswordRouter)
app.use("/inventory/passwordhandler", userMasterUpdatePasswordRouter)
app.use("/inventory", authControllerRouter)


const grnRouter = require("./routes/admin/grnRouter");
/**
 * TODO: mention ecomm-inventory routes
 */
app.use("/api/grn", grnRouter);

//external coupon 
app.use("/coupon", externalCouponRouter)


//stockTransfer routes
// app.use("/inventory/stockTransfer", stockTransferRouter);



// customer routes
app.use(authRouter);
app.use(listRouter);
app.use(invoiceRouter);
app.use("/cart", cartRouter);
app.use("/items", itemRouter);
app.use("/wallet", walletRouter);
app.use("/wishlist", wishlistRouter);
app.use("/address", addressRouter);
app.use("/profile", profileRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", orderRouter);
app.use("/orders", returnItemShowRouter)
app.use("/coupons", couponRouter);
app.use("/referral/view", referralRouter);
app.use("/gift", giftRouter);
app.use("/coupons", couponRouter);
app.use("/offers", offerRouter);
app.use("/gateway", gatewayRouter);
app.use("/whatsapp", whatsappRouter);
app.use("/leave", leaveRouter);
app.use("/task", taskRouter);
app.use(posRouter);
app.use(attendanceRouter);
app.use("/feedback", feedbackRouter);
app.use("/home", homePageRouter);
app.use("/adhoc", adhocRouter);

// admin routes
app.use("/admin/orders", adminOrderRouter);
app.use("/admin/coupon/to/customer", couponToCustomer);
app.use("/admin/wallet", adminWalletRouter);
app.use("/admin/specialwallet", adminSpecialWalletRouter);
app.use("/admin/customer", adminCustomerRouter);
app.use("/admin/customer", adminSpecialWalletCustomerRouter);
app.use("/admin/gift", adminGiftRouter);
app.use("/admin/coupons", adminCouponsRouter);
app.use("/admin/offers", adminOffersRouter);
app.use("/admin/leave", adminLeaveRouter);
app.use("/admin/task", adminTaskRouter);
app.use("/admin/attendance", adminAttendanceRouter);
app.use("/admin/delivery", adminDeliveryRouter);
app.use("/admin/vendor", adminVendorRouter);
app.use("/admin/vendor/items", adminVendorItemRouter);
app.use("/admin/items", adminItemsRouter);
app.use("/admin/banners", adminBannerRouter);
app.use("/admin/home", adminHomeRouter);
app.use("/admin/featured/categories", adminFeaturedCategoryRouter);
app.use("/admin/daily/sales", adminDailySalesRouter);
app.use("/admin/itemsp", adminItemWalletRouter);
app.use("/admin/ecomm/invoice", adminEcommInvoiceRouter);
app.use("/admin/market/survey", adminMarketSurveyRouter);

// report
app.use("/admin/report", adminReportRouter);

app.use("/admin/special/wallet", specialWalletRouter);

// milk (user)
app.use("/subscription", SubscriptionRouter);
app.use("/delivery", deliveryRouter);

// milk (admin)
app.use("/admin/milk/item", adminMilkItemsRouter);
app.use("/admin/milk/subscription", adminMilkSubscriptionRouter);

//delivery boy routes
app.use("/deliveryboy/orders", deliveryBoyOrderRouter);
app.use("/deliveryboy/milk", deliveryBoyMilkRouter);

//vendor routes

app.use("/vendor", vendorRouter);

//Start server and connect to DB
const db = require("./services/dbSetupService.js");
const returnItemShowController = require("./controllers/returnItemShowController");
const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Database connected`);
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

// ALL THE CRON JOBS

// 3
pos_refferal_job();

// 4
special_wallet_cashback_job();

// 1
refferal_job();
