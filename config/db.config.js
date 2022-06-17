// For Tanmoy da

//Let's keep all the values in the .env file and export this object. The values will be like
// process.env.HOST, process.env.USER ... rather than writing it here and .gitignoring it

//I have formatted the s3Config.js in a similar manner, check korenao


module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "root",
    DB: "grocernest",

    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};


// PORT : process.env.DB_PORT,