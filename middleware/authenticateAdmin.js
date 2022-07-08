const jwt = require('jsonwebtoken')

const authenticateAdmin = async (req, res, next) => {
    console.log("Admin authenticated or not")

    //Check header for access token
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(404).send({
            success: false,
            data: null,
            message: "Access token not found!!!!"
        })
    }
    //Get the token from the header
    const token = authHeader.split(' ')[1]
    try {
        next();
        //Verify the token
        // req.user = jwt.verify(token, "hello hello hello")
        // console.log(req.user);
        //  req.cust_no = req.user.cust_no
        //  next();

    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error.message,
            message: "Access token invalid/expired"
        })
    }
}

module.exports = authenticateAdmin