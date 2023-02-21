//For aditya sir

//We will put all the details in .env file and not keep it in config, this is just for development purpose

//Old database  -------> ecomm
//New database -------> grocernest_pre_prod

// module.exports = {
//     HOST: "152.67.1.126",
//     USER: "grocernest_pre_prod",
//     PASSWORD: "grocernest_pre_prod",
//     DB: "grocernest_pre_prod",

//     dialect: "mariadb",
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// };

module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "root",
  DB: "grocernest",

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
