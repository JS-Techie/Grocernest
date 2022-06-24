const express = require("express")
const router = express.Router();

// const authenticate = require("../middleware/authentication")

const {
    createWishlist,
    addItemToWishlist,
    getWishlistById,
    deleteWishlist
} =require ("../controllers/wishlistController")



router.route("/create").post(createWishlist)
router.route("/add/:wishlistId/item/:itemId").post(addItemToWishlist)
router.route("/view/:wishlistId").get(getWishlistById)
router.route("/delete/:wishlistId").delete(deleteWishlist)

module.exports = router;
