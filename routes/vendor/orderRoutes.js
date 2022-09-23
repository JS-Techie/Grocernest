const router = require("express").Router();

const authenticateVendor = require("../../middleware/authenticateVendor");

const {
  getAllOrdersOfVendor,
  getOrderById,
  createOrder,
  editOrder,
  deleteOrder,
} = require("../../controllers/vendor/orderController");

router.route("/view/all").get(authenticateVendor, getAllOrdersOfVendor);
router.route("/view/:id").get(authenticateVendor, getOrderById);
router.route("/create").post(authenticateVendor, createOrder);
router.route("/edit/:id").patch(authenticateVendor, editOrder);
router.route("/delete/:id").delete(authenticateVendor, deleteOrder);

module.exports = router;
