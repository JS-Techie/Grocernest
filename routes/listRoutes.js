const express = require("express")
const router = express.Router();

import authenticate from "../middleware/authentication" 

import{
    getAllCategories,
    getAllSubcategoriesInCategory
} from "../controllers/listController"

router.route("/categories").get(getAllCategories)
router.route("/subcategory/:categoryId").get(getAllSubcategoriesInCategory);

module.exports = router;