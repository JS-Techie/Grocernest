const express = require("express");
const router = express.Router();

// import authenticate from "../middleware/authentication"

const {
  getAllCategories,
  getAllSubcategoriesInCategory,
  getAllBrands,
  getAllOffers,
} = require("../controllers/listController");

router.route("/categories").get(getAllCategories);
router.route("/subcategory/:categoryId").get(getAllSubcategoriesInCategory);
router.route("/brands").get(getAllBrands);
router.route("/offers").get(getAllOffers);

module.exports = router;
