const express = require("express");
const router = express.Router();

const {
  getItemsInCategory,
  getItemsInSubcategory,
  getItemsBySearchTerm,
  getItemById,
  getAvailableQty,
  getAllItemsInABrand

} = require("../controllers/itemController");

router.route("/category/:categoryId").get(getItemsInCategory);
router
  .route("/category/:categoryId/subcategory/:subcategoryId")
  .get(getItemsInSubcategory);
router.route("/search/:searchTerm").get(getItemsBySearchTerm);
router.route("/:itemId").get(getItemById);
router.route("/available/quantity").post(getAvailableQty);
router.route("/brands/:brandId").get(getAllItemsInABrand)


module.exports = router;
