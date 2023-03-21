
const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {getMasterData} = require("../../../controllers/inventory/masterData/masterDataController");

router.route("/secure/master/getMasterData").post(authenticate,getMasterData)

module.exports = router;