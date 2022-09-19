const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllVendors,
  getVendorById,
  createVendor,
  editVendor,
  deleteVendor,
} = require("../../controllers/admin/vendorController");

router.route("/view/all").get(authenticateAdmin, getAllVendors);
router.route("/view/:id").get(authenticateAdmin, getVendorById);
router.route("/create").post(authenticateAdmin, createVendor);
router.route("/edit/:id").patch(authenticateAdmin, editVendor);
router.route("/delete/:id").delete(authenticateAdmin, deleteVendor);

module.exports = router;
