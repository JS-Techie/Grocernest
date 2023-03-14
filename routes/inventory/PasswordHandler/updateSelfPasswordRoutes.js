const router=require("express").Router()
const authenticateUser = require("../../../middleware/authenticateUser");
const updatePasswordController  =require ('../../../controllers/inventory/PasswordHandler/updatePasswordController')
router.route("/update/self").post(authenticateUser, updatePasswordController);
module.exports=router