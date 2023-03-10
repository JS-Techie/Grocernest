const express = require ("express");
const router = express.Router();

const authenticateAdmin = require("../../../middleware/authenticateAdmin");

const {
saveColor,
getAllColor,
activeColor,
deactiveColor,
getActiveColor,
getDeactiveColor,
} = require("../../../controllers/inventory/masterData/colorController");

router.route("/secure/color/saveColor").post(authenticateAdmin, saveColor);
router.route("/secure/color/getAllColor").post(authenticateAdmin,getAllColor);
router.route("/secure/color/activeColor").post(authenticateAdmin,activeColor);
router.route("/secure/color/deactiveColor").post(authenticateAdmin,deactiveColor);
router.route("/secure/color/getActiveColor").post(authenticateAdmin, getActiveColor);
router.route("/secure/color/getDeactiveColor").post(authenticateAdmin,getDeactiveColor);


module.exports= router;
