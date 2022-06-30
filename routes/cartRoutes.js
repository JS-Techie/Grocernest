const express = require("express")
const router = express.Router();

// import authenticate from "../middleware/authentication" 
const authenticate = require("../middleware/authentication")

const {
    saveCart,
    addItemToCart,
    removeItemFromCart,
    getCart
} = require( "../controllers/cartController");

router.route("/save").post(authenticate,saveCart);
router.route("/item/:itemId/add/:quantity").post(authenticate,addItemToCart); //Can be patch request also since we are essentially updating the cart
router.route("/item/:itemId/remove/:quantity").delete(authenticate,removeItemFromCart);
router.route("/view").get(authenticate, getCart)

module.exports = router;