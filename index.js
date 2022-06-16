const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/db.config.js");
const Sequelize = require("sequelize");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000


// database con.

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// module.exports = db;

app.listen(port, () => {
    db.sequelize.sync();
    console.log("Database connected & Server started on " + port);
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/registration', (req, res) => {
    res.send('Hello World!')
})


// async function connectDB() {
//     await debug.sequelize.sync();
//     console.log("db connected");
// }

// connectDB()
