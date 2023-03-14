const router=require("express").Router()
const authenticateUser = require("../../../middleware/authenticateUser");
const updatePassword  =require ('../../../controllers/inventory/PasswordHandler/updatePasswordController')

router.route("/update").post(authenticateUser, updatePassword);

module.exports=router