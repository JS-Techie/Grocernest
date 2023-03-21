const express = require("express");
const router = express.Router();

const {
    getAccessToken
} = require("../controllers/inventory/authController");


router.route("/secure/login/getAccessToken").post(getAccessToken);

module.exports = router;
