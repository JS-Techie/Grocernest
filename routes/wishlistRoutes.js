const express = require("express")
const router = express.Router();

import {
    createWishlist,
    addItemToWishlist,
    getWishlist,
    deleteWishlist
} from ("../controllers/wishlistController")

import authenticate from "../middleware/authentication.js";

//Authenticated routes, user cannot wishlist without logging in

router.route("/create").post(createWishlist)
router.route("/add/:wishlistId/item/:itemId").post(addItemToWishlist)
router.route("/view/:wishlistId").get(getWishlist)
router.route("/delete").delete(deleteWishlist)
