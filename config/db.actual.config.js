
module.exports = {
    HOST: "129.154.239.226",
    USER: "grocernest",
    PASSWORD: "Grocernest2022#",
    DB: "grocernest",

    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
