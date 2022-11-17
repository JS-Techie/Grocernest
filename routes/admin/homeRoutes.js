const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllFeaturedBrands,
  getFeaturedBrandById,
  createFeaturedBrand,
  editFeaturedBrand,
  deleteFeaturedBrand,
} = require("../../controllers/admin/homeController");

router.route("/view/all/featured").get(authenticateAdmin, getAllFeaturedBrands);
router.route("/view/featured/:id").get(authenticateAdmin, getFeaturedBrandById);
router.route("/create/featured").post(authenticateAdmin, createFeaturedBrand);
router.route("/edit/featured/:id").patch(authenticateAdmin, editFeaturedBrand);
router
  .route("/delete/featured/:id")
  .delete(authenticateAdmin, deleteFeaturedBrand);


module.exports = router;
