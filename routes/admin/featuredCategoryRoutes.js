const router = require("express").Router();
const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllFeaturedCategories,
  getFeaturedCategoryById,
  createFeaturedCategory,
  editFeaturedCategory,
  deleteFeaturedCategory,
} = require("../../controllers/admin/featuredCategoryController");

router.route("/view/all").get(authenticateAdmin, getAllFeaturedCategories);
router.route("/view/:id").get(authenticateAdmin, getFeaturedCategoryById);
router.route("/create").post(authenticateAdmin, createFeaturedCategory);
router.route("/edit/:id").put(authenticateAdmin, editFeaturedCategory);
router.route("/delete/:id").delete(authenticateAdmin, deleteFeaturedCategory);

module.exports = router;
