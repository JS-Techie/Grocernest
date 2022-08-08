require("dotenv").config();
const refferal_job = require("./utils/CRON_REF_1");
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
const whatsappRouter = require('./routes/whatsappRoutes');

// admin routers import
const adminOrderRouter = require("./routes/admin/orderRoutes");
const adminWalletRouter = require("./routes/admin/walletRoutes");
const adminCustomerRouter = require("./routes/admin/customerRoutes");
const adminGiftRouter = require("./routes/admin/giftRoutes");
const adminCouponsRouter = require("./routes/admin/couponRoutes");
const adminOffersRouter = require("./routes/admin/offerRoutes");


// milk routes import (user)


// milk routes import (admin)
const adminMilkItemsRouter = require("./routes/admin/milkItemsRoutes");
const SubscriptionRouter = require("./routes/subscriptionRoutes");
const deliveryRouter = require("./routes/deliveryRoutes");
const adminMilkSubscriptionRouter = require("./routes/admin/milkSubscriptionRoutes");




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

// admin routes
app.use("/admin/orders", adminOrderRouter);
app.use("/admin/wallet", adminWalletRouter);
app.use("/admin/customer", adminCustomerRouter);
app.use("/admin/gift", adminGiftRouter);
app.use("/admin/coupons", adminCouponsRouter);
app.use("/admin/offers", adminOffersRouter);


// milk (user)
app.use("/subscription", SubscriptionRouter);
app.use("/delivery", deliveryRouter);

// milk (admin)
app.use("/admin/milk/item", adminMilkItemsRouter);
app.use("/admin/milk/subscription", adminMilkSubscriptionRouter);





//Start server and connect to DB
const db = require("./services/dbSetupService.js");
const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    console.log(`Database connected`);
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
refferal_job();
