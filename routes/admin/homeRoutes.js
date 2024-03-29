const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllFeaturedBrands,
  getFeaturedBrandById,
  createFeaturedBrand,
  editFeaturedBrand,
  deleteFeaturedBrand,
  getDemandList,
  sendNotification,
  reorderAllFeaturedBrands,
} = require("../../controllers/admin/homeController");

router.route("/view/all/featured").get(authenticateAdmin, getAllFeaturedBrands);
router.route("/reorder/all/featured").post(reorderAllFeaturedBrands);

router.route("/view/featured/:id").get(authenticateAdmin, getFeaturedBrandById);
router.route("/create/featured").post(authenticateAdmin, createFeaturedBrand);
router.route("/edit/featured/:id").patch(authenticateAdmin, editFeaturedBrand);
router
  .route("/delete/featured/:id")
  .delete(authenticateAdmin, deleteFeaturedBrand);

router.route("/list/view/demand").get(authenticateAdmin, getDemandList);
router.route("/send/notification").post(authenticateAdmin, sendNotification);

module.exports = router;
