const jwt = require("jsonwebtoken");

const findCustomerNumber = async (req, res, next) => {
  let currentUser = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const auth = req.headers.authorization;
    console.log(auth);
    const token = auth.split(" ")[1];
    console.log(token);
    if (token) {
      const user = jwt.verify(token, "hello hello hello");
      currentUser = user.cust_no;
    }
  }

  return currentUser;
};
module.exports = { findCustomerNumber };
