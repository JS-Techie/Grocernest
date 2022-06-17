require("dotenv").config();
require("express-async-errors");

//Express Setup
const express = require("express");
const app = express();

//Middleware
//We will later put the URL of frontend in the CORS config object so only frontend can call the API
const cors = require("cors");
const fileUpload = require("express-fileupload")
const xss = require("xss-clean")
app.use(cors());
app.use(express.json());
app.use(fileUpload())
app.use(xss());


app.get('/', (req, res, next) => {
    res.send('Grocernest API')
})


//routers

const authRouter = require("./routes/authRoutes")
const listRouter = require("./routes/listRoutes")
const cartRouter = require("./routes/cartRoutes")
const itemRouter = require("./routes/itemRoutes")
const walletRouter = require("./routes/walletRoutes")
const wishlistRouter = require("./routes/wishlistRoutes")


//routes

app.use(authRouter)
app.use(listRouter);
app.use("/cart",cartRouter)
app.use("/items", itemRouter)
app.use("/wallet", walletRouter)
app.use("/wishlist",wishlistRouter)


//Start server and connect to DB
const db = require("./services/dbSetup.js")
const PORT = process.env.PORT||8080
const start = async () => {
    try{
        await db.sequelize.sync();
        console.log(`Database connected`)
        app.listen(PORT, ()=>{
            console.log(`Server started on port ${PORT}`)
        })
    }
    catch(error){
        console.log(error)
    }
} 

start();
