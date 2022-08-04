const express = require("express");
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
    getAllSubscriptionsWithFilter,
    getSubscriptionDetailsById,
    editSubscription,
    editQuantity
} = require("../../controllers/admin/milkSubscriptionController");

router.route("/view/all").post(admin, getAllSubscriptionsWithFilter);
router.route("/view/:subscriptionID").get(admin, getSubscriptionDetailsById);
router.route("/edit/:subscriptionID").post(admin, editSubscription);
router.route("/edit/quantity/:subscriptionID").post(admin, editQuantity);

module.exports = router;
