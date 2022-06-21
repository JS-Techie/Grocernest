const express = require("express")
const router = express.Router();

const authenticate = require("../middleware/authentication")

const {
    createWishlist,
    addItemToWishlist,
    getWishlist,
    deleteWishlist
} =require ("../controllers/wishlistController")



router.route("/create").post(authenticate,createWishlist)
router.route("/add/:wishlistId/item/:itemId").post(authenticate,addItemToWishlist)
router.route("/view/:wishlistId").get(authenticate,getWishlist)
router.route("/delete").delete(authenticate,deleteWishlist)

module.exports = router;
