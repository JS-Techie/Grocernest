
module.exports = {
    HOST: "152.67.1.126",
    USER: "ecomm",
    PASSWORD: "ecomm@123",
    DB: "grocernest",

    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
