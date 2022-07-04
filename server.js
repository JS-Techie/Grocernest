require("dotenv").config();

// Swagger UI Setup
const swaggerUI = require('swagger-ui-express');
const endPoint = require('./swagger/swagger-output.json');

//Express Setup
const express = require("express");
const app = express();


//Middleware
//We will later put the URL of frontend in the CORS config object so only frontend can call the API
const cors = require("cors");
const fileUpload = require("express-fileupload");
const xss = require("xss-clean");
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(xss());

app.get("/", (req, res, next) => {
  res.send("Grocernest API");
});


// Swagger route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(endPoint));

//routers
const authRouter = require("./routes/authRoutes");
const listRouter = require("./routes/listRoutes");
const cartRouter = require("./routes/cartRoutes");
const itemRouter = require("./routes/itemRoutes");
const walletRouter = require("./routes/walletRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const addressRouter = require("./routes/addressRoutes");
const profileRouter = require("./routes/profileRoutes")
const checkoutRouter = require("./routes/checkoutRoutes")
const orderRouter = require("./routes/ordersRoutes")
const couponRouter = require("./routes/couponsRoutes")
const referralRouter = require("./routes/referralRoutes")
const giftRouter = require("./routes/giftRoutes")

//routes
app.get('/responses', (req, res) => {
  res.send(endPoint);
});


app.use(authRouter);
app.use(listRouter);
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
