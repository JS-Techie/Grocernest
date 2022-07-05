const express = require("express")
const router = express.Router();

const authenticate = require("../middleware/authentication")

const {
    createWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    deleteWishlist,
    getWishlist
} =require ("../controllers/wishlistController")



router.route("/create").post(authenticate, createWishlist)
router.route("/view").get(authenticate, getWishlist)
router.route("/add/item/:itemId").post(authenticate,addItemToWishlist)
router.route("/remove/item/:itemId").post(authenticate,removeItemFromWishlist)
router.route("/delete").delete(authenticate,deleteWishlist)

// router.route("/view/:wishlistId").get(getWishlistById)

module.exports = router;
