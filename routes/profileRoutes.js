const express = require("express");
const router = express.Router();

// const authenticate = require("../middleware/authentication")

const {
    getProfile,
    uploadProfile,
    editProfile
} = require("../controllers/profileController")

//Add auth middleware to every controller

router.route('/view').get(getProfile)
router.route('/upload').post(uploadProfile)
router.route('/edit').post(editProfile) //Should be put request instead of post


module.exports = router;