const jwt = require('jsonwebtoken')

const authenticate = async (req, res, next) => {

  //Check header for access token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new Error('Access token not found')
  }
  //Get the token from the header
  const token = authHeader.split(' ')[1]
  try {
    //Verify the token
     req.user = jwt.verify(token, "hello hello hello")
     console.log(req.user)
     req.cust_no = req.user.cust_no
     next();

  } catch (error) {
    console.log(error.message)
    throw new Error('Access token Invalid/Expired')
  }
}

module.exports = authenticate