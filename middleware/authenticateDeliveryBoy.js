const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(404).send({
      success: false,
      data: [],
      message: "Access token not found!!!!",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, "cosmetixkey");
    console.log(req.user);
    if (req.user.USERROLELIST[0].roleId !== 4) {
      return res.status(403).send({
        success: false,
        data: [],
        message: "This user is not a delivery personnel",
      });
    }

    req.role = req.user.USERROLELIST[0].roleName;
    req.is_delivery_boy = true;
    req.delivery_boy = req.user.iss;
    req.user_id = req.user.USERID;
    next();
  } catch (error) {
    return res.status(403).send({
      success: false,
      data: [],
      message: "Access token invalid/expired",
    });
  }
};

module.exports = authenticate;
