const router= require("express").Router()

const authenticateAdmin =require('../../../middleware/authenticateAdmin')
const updatePasswordController = require('../../../controllers/inventory/PasswordHandler/updatePasswordController')


router.route('/update/user').post(authenticateAdmin, updatePasswordController)

module.exports=router