const express = require("express");
const router = express.Router();

const {
    login
} = require("../controllers/inventory/authController");


router.route("/secure/login/getAccessToken").post(login);

module.exports = router;
