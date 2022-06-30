const express = require("express")
const router = express.Router();

// import authenticate from "../middleware/authentication" 
const authenticate = require("../middleware/authentication")

const {
    saveCart,
    getItemCount,
    addItemToCart,
    subtractItemFromCart,
    removeItemFromCart,
    getCart
} = require("../controllers/cartController");

router.route("/save").post(authenticate, saveCart);
router.route("/item/count").get(authenticate, getItemCount);
router.route("/item/:itemId/add/:quantity").put(authenticate, addItemToCart); //Can be patch request also since we are essentially updating the cart
router.route("/item/:itemId/subtract").put(authenticate, subtractItemFromCart);
router.route("/item/:itemId/remove").delete(authenticate, removeItemFromCart);

router.route("/view").get(authenticate, getCart)

module.exports = router;