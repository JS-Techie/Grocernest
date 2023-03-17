
const express = require ("express")
const router = express.Router();

const authenticate = require("../middleware/authentication") 

const {getMasterData} = require("../controller/masterController");

router.route("/secure/master/getMasterData").post(authenticate,getMasterData)

module.exports = router;