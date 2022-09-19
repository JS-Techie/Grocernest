const router = require("express").Router();

const authenticateAdmin = require("../../middleware/authenticateAdmin");

const {
  getAllVendorOrders,
  getVendorOrderById,
  getVendorOrderByStatus,
  getVendorOrdersByVendorId,
  createVendorOrder,
  editStatusOfVendorOrder,
  editVendorOrder,
  deleteVendorOrder,
} = require("../../controllers/admin/vendorOrderController");

router.route("/view/all").get(authenticateAdmin, getAllVendorOrders);
router.route("/view/order/:orderId").get(authenticateAdmin, getVendorOrderById);
router
  .route("/view/vendor/:vendorId")
  .get(authenticateAdmin, getVendorOrdersByVendorId);
router
  .route("/view/status/:status")
  .get(authenticateAdmin, getVendorOrderByStatus);
router.route("/create").post(authenticateAdmin, createVendorOrder);
router
  .route("/status/:status")
  .patch(authenticateAdmin, editStatusOfVendorOrder);
router.route("/edit/:id").patch(authenticateAdmin, editVendorOrder);
router.route("/delete/:id").patch(authenticateAdmin, deleteVendorOrder);

module.exports = router;
