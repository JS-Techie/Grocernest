const express = require("express");
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin");

const {
  saveBrand,
  getAllBrand,
  getActiveBrand,
  getDeactiveBrand,
  activeBrand,
  deactiveBrand,
} = require("../../../controllers/inventory/masterData/brandController");

router.route("/secure/brand/saveBrand").post(authenticate, saveBrand);
router.route("/secure/brand/getAllBrand").post(authenticate, getAllBrand);
router.route("/secure/brand/getActiveBrand").post(authenticate, getActiveBrand);
router
  .route("/secure/brand/getDeactiveBrand")
  .post(authenticate, getDeactiveBrand);
router.route("/secure/brand/activeBrand").post(authenticate, activeBrand);
router.route("/secure/brand/deactiveBrand").post(authenticate, deactiveBrand);

module.exports = router;
