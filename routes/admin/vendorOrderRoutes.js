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
  getAllInvoices,
  getInvoiceByOrderId,
  updatePaymentStatus,
} = require("../../controllers/admin/vendorOrderController");

router.route("/view/all").get(authenticateAdmin, getAllVendorOrders);
router
  .route("/view/order/:order_id")
  .get(authenticateAdmin, getVendorOrderById);
router
  .route("/view/vendor/:id")
  .get(authenticateAdmin, getVendorOrdersByVendorId);
router
  .route("/view/status/:status")
  .get(authenticateAdmin, getVendorOrderByStatus);
router.route("/create").post(authenticateAdmin, createVendorOrder);
router
  .route("/status/:status")
  .patch(authenticateAdmin, editStatusOfVendorOrder);
router.route("/edit/:order_id").patch(authenticateAdmin, editVendorOrder);
router.route("/delete/:order_id").patch(authenticateAdmin, deleteVendorOrder);
router.route("/invoice/view/all").get(authenticateAdmin, getAllInvoices);
router
  .route("/invoice/view/:order_id")
  .get(authenticateAdmin, getInvoiceByOrderId);
router
  .route("/payment/:order_id")
  .patch(authenticateAdmin, updatePaymentStatus);

module.exports = router;
