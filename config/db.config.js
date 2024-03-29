require("dotenv").config();
// module.exports = {
//   HOST: "grocernest-dev.cccojqtgiuzf.ap-south-1.rds.amazonaws.com",
//   USER: "admin",
//   PASSWORD: "grocernest2021",
//   DB: "grocernest_pre_prod",

//   dialect: "mariadb",
//   define: {
//     timestamps: false,
//   },
//   timestamps: false,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// };

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB,

  dialect: "mariadb",
  define: {
    timestamps: false,
  },
  timestamps: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
