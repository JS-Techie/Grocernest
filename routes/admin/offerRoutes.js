const express = require("express");
const router = express.Router();

const admin = require("../../middleware/authenticateAdmin");

const {
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    activateOffer,
} = require("../../controllers/admin/offerController");

router.route("/view/all").get(admin, getAllOffers)
router.route("/view/:id").get(admin, getOfferById)
router.route("/create").post(admin, createOffer)
router.route("/update/:id").patch(admin, updateOffer)
router.route("/delete/:id").delete(admin, deleteOffer)
router.route("/activate/:id").patch(admin, activateOffer)


module.exports = router;