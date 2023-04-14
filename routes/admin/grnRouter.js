const express = require("express");
const router = express.Router();

const {
    saveDraftGrn,
    editGrn,
    updateGrnStatus,
    getGrnDetails,
    getVendorSpecificGrn,
    getGrnList 

} = require("../../controllers/admin/grnController");

router.route("/saveDraftGrn").post(saveDraftGrn);
router.route("/editGrn").post(editGrn);
router.route("/updateGrnStatus/:grnId").post(updateGrnStatus);
router.route("/getGrnDetails").post(getGrnDetails);
router.route("/getVendorSpecificGrn").post(getVendorSpecificGrn);
router.route("/getGrnList").post(getGrnList);

module.exports = router;