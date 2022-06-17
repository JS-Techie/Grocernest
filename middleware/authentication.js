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
    req.payload = jwt.verify(token, process.env.JWT_SECRET)
      //If authenticated, call associated controller from the route
    next()
  
  } catch (error) {
    throw new Error('Access token Invalid/Expired')
  }
}

module.exports = authenticate