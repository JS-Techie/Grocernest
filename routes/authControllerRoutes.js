const express = require("express");
const router = express.Router();

const {
    login
} = require("../controllers/inventory/authController");


router.route("/login").post(login);

module.exports = router;
