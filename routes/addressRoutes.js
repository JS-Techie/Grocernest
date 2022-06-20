const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authentication")

const{
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController")

router.route('/all').get(authenticate,getAllAddresses)
router.route('/add').post(authenticate,createAddress)
router.route('/update').post(authenticate,updateAddress) //Should be put/patch request
router.route('/delete').post(authenticate,deleteAddress) //Should be delete request


module.exports = router;