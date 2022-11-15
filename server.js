require("dotenv").config();
const refferal_job = require("./utils/CRON_REF_1");
const pos_refferal_job = require("./utils/CRON_REF_3");
// Swagger UI Setup
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

// admin routers import
const adminOrderRouter = require("./routes/admin/orderRoutes");
const adminWalletRouter = require("./routes/admin/walletRoutes");
const adminCustomerRouter = require("./routes/admin/customerRoutes");
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

//Vendor routes import

const vendorRouter = require("./routes/vendor/profileRoutes");

//routes
app.get("/responses", (req, res) => {
  res.send(endPoint);
});

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

// admin routes
app.use("/admin/orders", adminOrderRouter);
app.use("/admin/wallet", adminWalletRouter);
app.use("/admin/customer", adminCustomerRouter);
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
refferal_job();
pos_refferal_job();
