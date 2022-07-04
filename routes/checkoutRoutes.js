const express = require("express")
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    checkoutFromCart,
    buyNow
} = require("../controllers/checkoutController")


router.route("/cart").get(authenticate, checkoutFromCart);
router.route("/item").get(authenticate, buyNow);

module.exports = router;