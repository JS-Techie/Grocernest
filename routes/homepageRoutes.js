const router = require("express").Router();

const {
  allBigBanners,
  allSmallBanners,
  featuredBrands,
  getBestSellers,
  featuredCategories
} = require("../controllers/homepageController");

router.route("/view/banners/big").get(allBigBanners);
router.route("/view/banners/small").get(allSmallBanners);
router.route("/view/brands/featured").get(featuredBrands);
router.route("/view/bestsellers").get(getBestSellers);
router.route("/view/categories/featured").get(featuredCategories)

module.exports = router;
