const router = require("express").Router();
const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllFeaturedCategories,
  getFeaturedCategoryById,
  createFeaturedCategory,
  editFeaturedCategory,
  deleteFeaturedCategory,

  reorderAllFeaturedCategories,
} = require("../../controllers/admin/featuredCategoryController");

router.route("/view/all").get(authenticateAdmin, getAllFeaturedCategories);
router.route("/view/:id").get(authenticateAdmin, getFeaturedCategoryById);
router.route("/create").post(authenticateAdmin, createFeaturedCategory);
router.route("/edit/:id").put(authenticateAdmin, editFeaturedCategory);
router.route("/delete/:id").delete(authenticateAdmin, deleteFeaturedCategory);

router.route("/reorder/all").post(reorderAllFeaturedCategories);

module.exports = router;
