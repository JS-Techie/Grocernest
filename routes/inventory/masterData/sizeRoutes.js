const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {
    saveSize,
    getAllSize,
    getActiveSize,
    getDeactiveSize,
    activeSize,
    deactiveSize
} = require ("../../../controllers/inventory/masterData/sizeController"); 

router.route("/secure/size/saveSize").post(authenticate, saveSize);
router.route("/secure/size/getAllSize").post(authenticate,getAllSize);
router.route("/secure/size/getActiveSize").post(authenticate,getActiveSize);
router.route("/secure/size/getDeactiveSize").post(authenticate,getDeactiveSize);
router.route("/secure/size/activeSize").post(authenticate,activeSize);
router.route("/secure/size/deactiveSize").post(authenticate,deactiveSize); 

module.exports = router;