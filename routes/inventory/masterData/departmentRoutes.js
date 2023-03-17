const express = require ("express")
const router = express.Router();

const authenticate = require("../../../middleware/authenticateAdmin") 

const {
    saveDepartment,
    getAllDepartment,
    getActiveDepartment,
    getDeactiveDepartment,
    activeDepartment,
    deactiveDepartment
} = require ("../../../controllers/inventory/masterData/departmentController"); 

router.route("/secure/department/saveDepartment").post(authenticate, saveDepartment);
router.route("/secure/department/getAllDepartment").post(authenticate,getAllDepartment);
router.route("/secure/department/getActiveDepartment").post(authenticate,getActiveDepartment);
router.route("/secure/department/getDeactiveDepartment").post(authenticate,getDeactiveDepartment);
router.route("/secure/department/activeDepartment").post(authenticate,activeDepartment);
router.route("/secure/department/deactiveDepartment").post(authenticate,deactiveDepartment); 

module.exports = router;