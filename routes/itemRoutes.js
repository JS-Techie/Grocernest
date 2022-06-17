const express = require("express")
const router = express.Router();

import authenticate from "../middleware/authentication";

import{
    getItemsInCategory,
    getItemsInSubcategory,
    getItemsBySearchTerm
} from "../controllers/itemController";


router.route("/catgeory/:categoryId").get(getItemsInCategory)
router.route("/category/:categoryId/subcategory/:subcategoryId").get(getItemsInSubcategory)
router.route("/search/:searchTerm").get(getItemsBySearchTerm)

module.exports = router;