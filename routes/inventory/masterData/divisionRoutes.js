const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin")

const {
    saveDivision,
    getAllDivision,
    getActiveDivision,
    getDeactiveDivision,
    activeDivision,
    deactiveDivision
} = require("../../../controllers/inventory/masterData/divisionController")

router.route("/secure/division/saveDivision").post(authenticate, saveDivision);
router.route("/secure/division/getAllDivision").post(authenticate, getAllDivision);
router.route("/secure/division/getActiveDivision").post(authenticate, getActiveDivision);
router.route("/secure/division/getDeactiveDivision").post(authenticate,getDeactiveDivision);
router.route("/secure/division/activeDivision").post(authenticate,activeDivision);
router.route("/secure/division/deactiveDivision").post(authenticate,deactiveDivision);

module.exports = router;