const express = require("express");
const router = express.Router();

const {
    login ,
    // getAccessToken,
} = require("../../controllers/inventory/authController")
const getAccessToken=()=>{}

router.route("/attendance/login").post(login);
router.route("/secure/login/getAccessToken").post(getAccessToken);

module.exports = router; 