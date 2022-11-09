const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllItemsMappedToVendorById,
  getAllVendorAndMappedItems,
  createAnItemMappingToVendor,
  editAnItemMappedToVendor,
  deleteAnItemMappedToVendor,
} = require("../../controllers/admin/vendorItemsController");

router.route("/view/all").get(authenticateAdmin, getAllVendorAndMappedItems);
router.route("/view/:vendor_id").get(authenticateAdmin, getAllItemsMappedToVendorById);
router.route("/create/").post(authenticateAdmin, createAnItemMappingToVendor);
router.route("/edit/:id").patch(authenticateAdmin, editAnItemMappedToVendor);
router
  .route("/delete/:id")
  .delete(authenticateAdmin, deleteAnItemMappedToVendor);

module.exports = router;
