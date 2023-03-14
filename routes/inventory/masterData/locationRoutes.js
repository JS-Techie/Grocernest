const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {
    saveLocation,
    getAllLocation,
    getActiveLocation,
    getDeactiveLocation,
    activeLocation,
    deactiveLocation
} = require ("../../../controllers/inventory/masterData/locationController");

router.route("/secure/location/saveLocation").post(authenticate, saveLocation);
router.route("/secure/location/getAllLocation").post(authenticate, getAllLocation);
router.route("/secure/location/getActiveLocation").post(authenticate, getActiveLocation);
router.route("/secure/location/getDeactiveLocation").post(authenticate, getDeactiveLocation);
router.route("/secure/location/activeLocation").post(authenticate, activeLocation);
router.route("/secure/location/deactiveLocation").post(authenticate, deactiveLocation);

module.exports = router;