const router = require("express").Router();

const authenticate = require("../middleware/authentication");

const {
  allBigBanners,
  allSmallBanners,
  featuredBrands,
  getBestSellers,
  featuredCategories,
  createDemand,
  notify,
  frequentlyBoughtItems
} = require("../controllers/homepageController");

router.route("/view/banners/big").get(allBigBanners);
router.route("/view/banners/small").get(allSmallBanners);
router.route("/view/brands/featured").get(featuredBrands);
router.route("/view/bestsellers").get(getBestSellers);
router.route("/view/categories/featured").get(featuredCategories);
router.route("/create/demand").post(authenticate,createDemand);
router.route("/notify").post(authenticate,notify);
router.route("/frequent").post(authenticate,frequentlyBoughtItems);

module.exports = router;
