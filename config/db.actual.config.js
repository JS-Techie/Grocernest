

//For aditya sir

//We will put all the details in .env file and not keep it in config, this is just for development purpose

module.exports = {
    HOST: "152.67.1.126",
    USER: "ecomm",
    PASSWORD: "ecomm@123",
    DB: "ecomm",

    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
