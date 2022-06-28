const express = require("express")
const router = express.Router();

const authenticate = require("../middleware/authentication")

const {
    createWishlist,
    addItemToWishlist,
    getWishlistById,
    deleteWishlist,
    getAllWishlists
} =require ("../controllers/wishlistController")



router.route("/create").post(authenticate, createWishlist)
router.route("/view").get(authenticate, getAllWishlists)
router.route("/add/:wishlistId/item/:itemId").post(addItemToWishlist)
router.route("/view/:wishlistId").get(getWishlistById)
router.route("/delete/:wishlistId").delete(deleteWishlist)

module.exports = router;
