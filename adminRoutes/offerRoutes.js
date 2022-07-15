const express = require("express");
const router = express.Router();

const admin = require("../middleware/authenticateAdmin");

const{
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer
} = require("../adminControllers/offerController");

router.route("/view/all").get(admin, getAllOffers)
router.route("/view/:id").get(admin, getOfferById)
router.route("/create").post(admin, createOffer)
router.route("/update/:id").put(admin, updateOffer)
router.route("/delete/:id").delete(admin, deleteOffer)


module.exports = router;