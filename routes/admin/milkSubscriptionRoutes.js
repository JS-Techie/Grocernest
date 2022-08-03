const express = require("express");
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
    getAllSubscriptionsWithFilter,
    getSubscriptionDetailsById,
    editSubscription,
} = require("../../controllers/admin/milkSubscriptionController");

router.route("/view/all").get(admin, getAllSubscriptionsWithFilter);
router.route("/view/:subscriptionID").get(admin, getSubscriptionDetailsById);
router.route("/edit/:subscriptionID").post(admin, editSubscription);

module.exports = router;
