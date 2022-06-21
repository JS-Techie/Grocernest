const express = require("express")
const router = express.Router();

// import authenticate from "../middleware/authentication" 

const {
    saveCart,
    addItemToCart,
    removeItemFromCart
} = require( "../controllers/cartController");

router.route("/save").post(saveCart);
router.route("/item/:itemId/add/:quantity").post(addItemToCart); //Can be patch request also since we are essentially updating the cart
router.route("/item/:itemId/remove/:quantity").delete(removeItemFromCart);

module.exports = router;