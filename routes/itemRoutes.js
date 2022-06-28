const express = require("express")
const router = express.Router();

// import authenticate from "../middleware/authentication";

const{
    getItemsInCategory,
    getItemsInSubcategory,
    getItemsBySearchTerm,
    getItemById
} = require( "../controllers/itemController");


router.route("/category/:categoryId").get(getItemsInCategory)
router.route("/category/:categoryId/subcategory/:subcategoryId").get(getItemsInSubcategory)
router.route("/search/:searchTerm").get(getItemsBySearchTerm)
router.route("/:itemId").get(getItemById)

module.exports = router;