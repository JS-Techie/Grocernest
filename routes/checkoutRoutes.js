const express = require("express")
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    checkoutFromCart,
    buyNow
} = require("../controllers/checkoutController")


router.route("/cart").post(authenticate, checkoutFromCart);
router.route("/item").post(authenticate, buyNow);

module.exports = router;