const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  createBanner,
  getAllBanners,
  getBannerById,
  deleteBanner,
} = require("../../controllers/admin/bannerController");

router.route("/view/all").get(authenticateAdmin, getAllBanners);
router.route("/view/:id").get(authenticateAdmin, getBannerById);
router.route("/create").get(authenticateAdmin, createBanner);
router.route("/delete/:id").get(authenticateAdmin, deleteBanner);

module.exports = router;
