const express = require("express");
const router = express.Router();

const admin = require("../middleware/authenticateAdmin")

const {getAllSubscriptions,getSubscriptionById,editSubscription,generateInvoice} = require("../adminControllers/subscriptionController");

router.route("/view/all").get(getAllSubscriptions);
router.route("/view/:subscriptionID").get(getSubscriptionById);
router.route("edit/:subscriptionID").patch(editSubscription)
router.route("/invoice").get(generateInvoice);

module.exports = router;