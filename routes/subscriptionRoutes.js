const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication");

const {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  modifySubscriptionStatus,
  editSubscriptionDetails,
  deleteSubscription,
  getAllItems
} = require("../controllers/subscriptionController");

router.route("/view/all").get(authenticate, getAllSubscriptions);
router.route("/view/:id").get(authenticate, getSubscriptionById);
router.route("/create").post(authenticate, createSubscription);
router.route("/modify/:id").patch(authenticate, modifySubscriptionStatus);
router.route("/edit/:id").post(authenticate, editSubscriptionDetails);
router.route("/delete/:id").delete(authenticate, deleteSubscription);
router.route("/items").get(authenticate, getAllItems)

module.exports = router;
