const express = require("express");
const router = express.Router();

const {
    getOriginalUrl
} = require("../controllers/urlShortenerController");

router.route("/invoice/download/:id").get(getOriginalUrl);

module.exports = router;
