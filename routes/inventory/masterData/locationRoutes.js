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

router.route("/secure/Location/saveLocation").post(authenticate, saveLocation);
router.route("/secure/Location/getAllLocation").post(authenticate,getAllLocation);
router.route("/secure/Location/getActiveLocation").post(authenticate,getActiveLocation);
router.route("/secure/Location/getDeactiveLocation").post(authenticate,getDeactiveLocation);
router.route("/secure/Location/activeLocation").post(authenticate,activeLocation);
router.route("/secure/Location/deactiveLocation").post(authenticate,deactiveLocation);

module.exports = router;